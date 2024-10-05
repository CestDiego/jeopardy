import { NeonClient } from './client'
import type { Branch } from './types'
import { logger } from '../../../../shared/src/logger'

class NeonDBUtils {
  private readonly NEON_API_KEY: string
  private readonly STAGE: string
  private readonly ROLE_NAME: string = 'OndeVamos_owner'
  private readonly DB_NAME: string = 'OndeVamos'
  private readonly PROJECT_NAME: string = 'OndeDev'
  private readonly MAX_RETRIES: number = 60
  private readonly RETRY_DELAY: number = 10000 // 10 seconds

  private client: NeonClient
  private logger: typeof logger

  constructor({
    neonApiKey,
    config: {
      roleName,
      dbName,
      projectName,
    },
    stage,
  }: { neonApiKey: string; stage: string; config: { roleName: string; dbName: string; projectName: string } }) {
    this.NEON_API_KEY = neonApiKey
    this.STAGE = stage
    this.ROLE_NAME = roleName
    this.DB_NAME = dbName
    this.PROJECT_NAME = projectName
    this.client = new NeonClient({ apiKey: this.NEON_API_KEY })
    this.logger = logger
  }

  public getSourceBranchForStage(stage: string): string {
    if (stage === 'prod') return 'main'
    if (stage === 'staging' || stage === 'dev') {
      return 'main'
    }
    // this includes pr branches and locals
    return 'dev'
  }

  public getBranchNameForStage(stage: string): string {
    if (stage === 'prod') return 'main'
    if (stage === 'dev') return 'dev'
    if (stage.startsWith('pr')) {
      return `ephemeral/${stage}`
    }
    return `dev/${stage}`
  }

  public async getProject() {
    const { projects } = await this.client.listProjects()
    if (projects.length === 0) throw new Error('No projects found')

    console.log(`Getting project ${this.PROJECT_NAME}`)
    const project = projects.find((project) => project.name === this.PROJECT_NAME)
    if (!project) throw new Error(`Project ${this.PROJECT_NAME} not found`)
    return project
  }

  private async createBranch(options: CreateBranchOptions): Promise<Branch> {
    const { newBranchName, sourceBranchId, projectId } = options
    console.log(`Creating branch because it does not exist: ${newBranchName}`)
    return this.client.createBranch(projectId, {
      endpoints: [
        {
          type: 'read_write',
        },
      ],
      branch: {
        name: newBranchName,
        parent_id: sourceBranchId,
      },
    })
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async waitForBranchReady(projectId: string, branchName: string): Promise<Branch> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      console.log(
        `Checking if branch ${branchName} is ready: (${i + 1}/${this.MAX_RETRIES} retries)`
      )
      const { branches } = await this.client.listBranches(projectId)
      const branch = branches.find((b) => b.name === branchName && b.current_state === 'ready')

      if (branch && branch.current_state === 'ready') {
        return branch
      }

      await this.sleep(this.RETRY_DELAY)
    }

    throw new Error(
      `Branch ${branchName} did not become ready within the expected time of ${(this.MAX_RETRIES * this.RETRY_DELAY) / 1000} seconds}`
    )
  }

  public async getOrCreateBranch(
    options: GetOrCreateBranchOptions = {
      resetBranch: false,
    }
  ): Promise<Branch & { uri: string }> {
    const { resetBranch } = options
    const { id: projectId } = await this.getProject()

    const sourceBranchName = this.getSourceBranchForStage(this.STAGE)
    const targetBranchName = this.getBranchNameForStage(this.STAGE)

    console.log(`Source Branch for stage ${this.STAGE}: ${sourceBranchName}`)
    try {
      console.log(`Getting or creating branch ${targetBranchName}`)
      const { branches } = await this.client.listBranches(projectId)
      if (branches.length === 0) throw new Error('No branches found')
      const sourceBranch = branches.find((branch) => branch.name === sourceBranchName)

      if (!sourceBranch) throw new Error(`Source branch ${sourceBranchName} found`)

      // Get the branch
      let targetBranch = branches.find((branch) => branch.name === targetBranchName)
      // If not exist, we create it
      if (!targetBranch) {
        const createdBranch = await this.createBranch({
          newBranchName: targetBranchName,
          sourceBranchId: sourceBranch.id,
          projectId,
        })
        console.log({ createdBranch })
        targetBranch = await this.waitForBranchReady(projectId, targetBranchName)
      } else {
        console.info(`Error Creating the branch: ${targetBranchName}`)
      }

      // Reset branch
      if (resetBranch && targetBranch) {
        console.log(`Resetting Branch ${targetBranch.name} to its parent: ${sourceBranch.name}`)
        try {
          await this.client.restoreBranch(projectId, targetBranch.id, {
            source_branch_id: sourceBranch.id,
          })
        } catch (err) {
          console.error(err)
          console.error(new Error(`Failure trying to restore branch ${targetBranch.name}`))
        }
      }

      if (!targetBranch) {
        throw new Error(`Target branch ${targetBranchName} not found`)
      }

      const { uri } = await this.client.getConnectionUri(projectId, {
        branchId: targetBranch.id,
        pooled: true,
        databaseName: this.DB_NAME,
        roleName: this.ROLE_NAME,
      })

      return { ...targetBranch, uri }
    } catch (error) {
      console.error('Error getting or creating branch', error)
      throw error
    }
  }

  public async getConnectionURIForBranch(branchName: string): Promise<string> {
    const { id: projectId } = await this.getProject()
    const { branches } = await this.client.listBranches(projectId)
    const branch = branches.find((branch) => branch.name === branchName)
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`)
    }
    const { uri } = await this.client.getConnectionUri(projectId, {
      branchId: branch.id,
      pooled: true,
      databaseName: this.DB_NAME,
      roleName: this.ROLE_NAME,
    })

    this.logger.info(`Using branch ${branchName}`)
    return uri
  }

  public async getDatabaseString(): Promise<string> {
    const branch = await this.getOrCreateBranch()
    if (!branch) {
      throw new Error('Branch not found')
    }
    const connectionString = branch.uri
    console.log(`Using branch: ${branch.name}`)
    return connectionString
  }

  public async deleteBranchByName(): Promise<string> {
    const { id: projectId } = await this.getProject()

    const branchName = this.getBranchNameForStage(this.STAGE)
    const { branches } = await this.client.listBranches(projectId)
    const filteredBranches = branches.filter((branch) => branch.name === branchName)
    // TODO: Check whether this should not throw but instead it should be logged
    // in case some stuff breaks
    if (filteredBranches.length === 0)
      throw new Error(`No branch found with the name ${branchName}`)

    const [{ id: branchId }] = filteredBranches
    await this.client.deleteBranch(projectId, branchId)
    return `Branch ${branchName} deleted`
  }
}

// Define interfaces
interface CreateBranchOptions {
  newBranchName: string;
  sourceBranchId: string;
  projectId: string;
}

interface GetOrCreateBranchOptions {
  resetBranch: boolean;
}

export default NeonDBUtils;