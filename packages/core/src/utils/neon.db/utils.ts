import { isPRStage } from "@onde-vamos/shared/utils";
import { NeonClient } from "./client";
import type { Branch } from "./types";

const NEON_API_KEY = process.env.NEON_API_KEY;
if (!NEON_API_KEY) throw new Error("NEON_API_KEY is not defined");

const STAGE = process.env.STAGE || process.env.SST_STAGE;
if (!STAGE) throw new Error("Both SST_STAGE and STAGE are undefined.");

const ROLE_NAME = "OndeVamos_owner";
const DB_NAME = "OndeVamos";
const PROJECT_NAME = "OndeDev";
const MAX_RETRIES = 60;
const RETRY_DELAY = 10000; // 10 seconds

export const getSourceBranchForStage = (stage: string) => {
  if (stage === "prod") return "main";
  if (stage === "staging" || stage === "dev") {
    return "main";
  }
  // this includes pr branches and locals
  return "dev";
};

export const getBranchForStage = (stage: string) => {
  if (stage === "prod") return "main";
  if (stage === "staging") return "staging";
  if (isPRStage(stage)) {
    return `ephemeral/${stage}`;
  }
  return `dev/${stage}`;
};

const client = new NeonClient({ apiKey: NEON_API_KEY });

export const getProject = async () => {
  const { projects } = await client.listProjects();
  if (projects.length === 0) throw new Error("No projects found");

  console.log(`Getting project ${PROJECT_NAME}`);
  const project = projects.find((project) => project.name === PROJECT_NAME);
  if (!project) throw new Error(`Project ${PROJECT_NAME} not found`);
  return project;
};

type CreateBranchOptions = {
  newBranchName: string;
  sourceBranchId: string;
  projectId: string;
};

export const createBranch = async (options: CreateBranchOptions) => {
  const { newBranchName, sourceBranchId, projectId } = options;
  console.log(`Creating branch because it does not exist: ${newBranchName}`);
  return client.createBranch(projectId, {
    endpoints: [
      {
        type: "read_write",
      },
    ],
    branch: {
      name: newBranchName,
      parent_id: sourceBranchId,
    },
  });
};

interface GetOrCreateBranchOptions {
  resetBranch: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForBranchReady = async (
  projectId: string,
  branchName: string,
): Promise<Branch> => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    console.log(
      `Checking if branch ${branchName} is ready: (${i + 1}/${MAX_RETRIES} retries)`,
    );
    const { branches } = await client.listBranches(projectId);
    const branch = branches.find(
      (b) => b.name === branchName && b.current_state === "ready",
    );

    if (branch && branch.current_state === "ready") {
      return branch;
    }

    await sleep(RETRY_DELAY);
  }

  throw new Error(
    `Branch ${branchName} did not become ready within the expected time of ${(MAX_RETRIES * RETRY_DELAY) / 1000} seconds}`,
  );
};

export const getOrCreateBranch = async (
  options: GetOrCreateBranchOptions = {
    resetBranch: false,
  },
): Promise<Branch & { uri: string }> => {
  const { resetBranch } = options;
  const { id: projectId } = await getProject();

  const sourceBranchName = getSourceBranchForStage(STAGE);
  const targetBranchName = getBranchForStage(STAGE);

  console.log(`Source Branch for stage ${STAGE}: ${sourceBranchName}`);
  try {
    console.log(`Getting or creating branch ${targetBranchName}`);
    const { branches } = await client.listBranches(projectId);
    if (branches.length === 0) throw new Error("No branches found");
    const sourceBranch = branches.find(
      (branch) => branch.name === sourceBranchName,
    );

    if (!sourceBranch)
      throw new Error(`Source branch ${sourceBranchName} found`);

    // Get the branch
    let targetBranch = branches.find(
      (branch) => branch.name === targetBranchName,
    );
    // If not exist, we create it
    if (!targetBranch) {
      const createdBranch = await createBranch({
        newBranchName: targetBranchName,
        sourceBranchId: sourceBranch.id,
        projectId,
      });
      console.log({ createdBranch });
      targetBranch = await waitForBranchReady(projectId, targetBranchName);
    } else {
      console.info(`Error Creating the branch: ${targetBranchName}`);
    }

    // Reset branch
    if (resetBranch) {
      console.log(
        `Resetting Branch ${targetBranch.name} to its parent: ${sourceBranch.name}`,
      );
      try {
        await client.restoreBranch(projectId, targetBranch.id, {
          source_branch_id: sourceBranch.id,
        });
      } catch (err) {
        console.error(err);
        console.error(
          new Error(`Failure trying to restore branch ${targetBranch.name}`),
        );
      }
    }
    const { uri } = await client.getConnectionUri(projectId, {
      branchId: targetBranch.id,
      pooled: true,
      databaseName: DB_NAME,
      roleName: ROLE_NAME,
    });

    return { ...targetBranch, uri };
  } catch (error) {
    console.error("Error getting or creating branch", error);
    throw error;
  }
};

export const deleteBranchByName = async () => {
  const { id: projectId } = await getProject();

  const branchName = getBranchForStage(STAGE);
  const { branches } = await client.listBranches(projectId);
  const filteredBranches = branches.filter(
    (branch) => branch.name === branchName,
  );
  // TODO: Check whether this should not throw but instead it should be logged
  // in case some stuff breaks
  if (filteredBranches.length === 0)
    throw new Error(`No branch found with the name ${branchName}`);

  const [{ id: branchId }] = filteredBranches;
  await client.deleteBranch(projectId, branchId);
  return `Branch ${branchName} deleted`;
};
