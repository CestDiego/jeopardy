import type { NeonConfig } from "./config";
import type {
  Branch,
  ConnectionUri,
  CreateBranchRequest,
  CreateRoleRequest,
  DeleteBranchResponse,
  ListBranchesResponse,
  ListProjectsResponse,
  ListRolesResponse,
  ResetRolePasswordResponse,
  RestoreBranchRequest,
  RestoreBranchResponse,
  Role,
} from "./types";

export class NeonClient {
  private config: NeonConfig;

  constructor(config: NeonConfig) {
    this.config = {
      baseUrl: "https://console.neon.tech/api/v2",
      ...config,
    };
  }

  // biome-ignore lint: utils need any
  private async fetchJson(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async listProjects(): Promise<ListProjectsResponse> {
    const url = `${this.config.baseUrl}/projects`;
    return this.fetchJson(url);
  }

  async listBranches(projectId: string): Promise<ListBranchesResponse> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches`;
    return this.fetchJson(url);
  }

  async createBranch(
    projectId: string,
    data: CreateBranchRequest,
  ): Promise<Branch> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches`;
    return this.fetchJson(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async restoreBranch(
    projectId: string,
    branchId: string,
    data: RestoreBranchRequest,
  ): Promise<RestoreBranchResponse> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/restore`;
    return this.fetchJson(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(
    projectId: string,
    branchId: string,
  ): Promise<DeleteBranchResponse> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}`;
    return this.fetchJson(url, {
      method: "DELETE",
    });
  }
  async getConnectionUri(
    projectId: string,
    options?: {
      branchId?: string;
      endpointId?: string;
      databaseName?: string;
      roleName?: string;
      pooled?: boolean;
    },
  ): Promise<ConnectionUri> {
    let url = `${this.config.baseUrl}/projects/${projectId}/connection_uri`;
    const params = new URLSearchParams();
    if (options) {
      if (options.branchId) params.append("branch_id", options.branchId);
      if (options.endpointId) params.append("endpoint_id", options.endpointId);
      if (options.databaseName)
        params.append("database_name", options.databaseName);
      if (options.roleName) params.append("role_name", options.roleName);
      if (options.pooled !== undefined)
        params.append("pooled", String(options.pooled));
    }
    if (params.toString()) url += `?${params.toString()}`;
    return this.fetchJson(url);
  }
  async listRoles(
    projectId: string,
    branchId: string,
  ): Promise<ListRolesResponse> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles`;
    return this.fetchJson(url);
  }

  async getRole(
    projectId: string,
    branchId: string,
    roleName: string,
  ): Promise<Role> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles/${roleName}`;
    return this.fetchJson(url);
  }

  async createRole(
    projectId: string,
    branchId: string,
    data: CreateRoleRequest,
  ): Promise<Role> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles`;
    return this.fetchJson(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteRole(
    projectId: string,
    branchId: string,
    roleName: string,
  ): Promise<void> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles/${roleName}`;
    await this.fetchJson(url, {
      method: "DELETE",
    });
  }

  async getRolePassword(
    projectId: string,
    branchId: string,
    roleName: string,
  ): Promise<string> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles/${roleName}/password`;
    const response = await this.fetchJson(url);
    return response.password;
  }

  async resetRolePassword(
    projectId: string,
    branchId: string,
    roleName: string,
  ): Promise<ResetRolePasswordResponse> {
    const url = `${this.config.baseUrl}/projects/${projectId}/branches/${branchId}/roles/${roleName}/reset_password`;
    return this.fetchJson(url, {
      method: "POST",
    });
  }
}
