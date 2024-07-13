// Types for ListProjects response
export interface ListProjectsResponse {
  projects: Project[];
  pagination: Pagination;
}

export interface Project {
  id: string;
  platform_id: string;
  region_id: string;
  name: string;
  provisioner: "k8s-pod" | "k8s-neonvm";
  default_endpoint_settings: EndpointSettings;
  settings: ProjectSettings;
  pg_version: number;
  proxy_host: string;
  branch_logical_size_limit: number;
  branch_logical_size_limit_bytes: number;
  store_passwords: boolean;
  active_time: number;
  cpu_used_sec: number;
  maintenance_starts_at: string;
  creation_source: string;
  created_at: string;
  updated_at: string;
  synthetic_storage_size: number;
  quota_reset_at: string;
  owner_id: string;
  compute_last_active_at: string;
  org_id: string;
}

export interface EndpointSettings {
  pg_settings: Record<string, string>;
  pgbouncer_settings: Record<string, string>;
  autoscaling_limit_min_cu: number;
  autoscaling_limit_max_cu: number;
  suspend_timeout_seconds: number;
}

export interface ProjectSettings {
  quota: ProjectQuota;
  allowed_ips: AllowedIPs;
  enable_logical_replication: boolean;
}

export interface ProjectQuota {
  active_time_seconds: number;
  compute_time_seconds: number;
  written_data_bytes: number;
  data_transfer_bytes: number;
  logical_size_bytes: number;
}

export interface AllowedIPs {
  ips: string[];
  protected_branches_only: boolean;
  primary_branch_only: boolean;
}

export interface Pagination {
  cursor: string;
}

// Types for ListBranches response
export interface ListBranchesResponse {
  branches: Branch[];
}

export interface Branch {
  id: string;
  project_id: string;
  parent_id: string;
  parent_lsn: string;
  parent_timestamp: string;
  name: string;
  current_state: "init" | "ready";
  pending_state: "init" | "ready";
  logical_size: number;
  creation_source: string;
  primary: boolean;
  protected: boolean;
  cpu_used_sec: number;
  compute_time_seconds: number;
  active_time_seconds: number;
  written_data_bytes: number;
  data_transfer_bytes: number;
  created_at: string;
  updated_at: string;
  last_reset_at: string;
}

// Types for CreateBranch request body
export interface CreateBranchRequest {
  endpoints?: EndpointRequest[];
  branch?: BranchRequest;
}

export interface EndpointRequest {
  type: "read_only" | "read_write";
  autoscaling_limit_min_cu?: number;
  autoscaling_limit_max_cu?: number;
  provisioner?: "k8s-pod" | "k8s-neonvm";
  suspend_timeout_seconds?: number;
}

export interface BranchRequest {
  parent_id?: string;
  name?: string;
  parent_lsn?: string;
  parent_timestamp?: string;
  protected?: boolean;
}

// Types for RestoreBranch request body
export interface RestoreBranchRequest {
  source_branch_id: string;
  source_lsn?: string;
  source_timestamp?: string;
  preserve_under_name?: string;
}

// Types for RestoreBranch response
export interface RestoreBranchResponse {
  branch: Branch;
  operations: Operation[];
}

export interface Operation {
  id: string;
  project_id: string;
  branch_id?: string;
  endpoint_id?: string;
  action: OperationAction;
  status: OperationStatus;
  error?: string;
  failures_count: number;
  retry_at?: string;
  created_at: string;
  updated_at: string;
  total_duration_ms: number;
}

export type OperationAction =
  | "create_compute"
  | "create_timeline"
  | "start_compute"
  | "suspend_compute"
  | "apply_config"
  | "check_availability"
  | "delete_timeline"
  | "create_branch"
  | "tenant_ignore"
  | "tenant_attach"
  | "tenant_detach"
  | "tenant_reattach"
  | "replace_safekeeper"
  | "disable_maintenance"
  | "apply_storage_config"
  | "prepare_secondary_pageserver"
  | "switch_pageserver";

export type OperationStatus =
  | "scheduling"
  | "running"
  | "finished"
  | "failed"
  | "error"
  | "cancelling"
  | "cancelled"
  | "skipped";

export interface DeleteBranchResponse {
  branch: Branch;
  operations: Operation[];
}

export interface ConnectionUri {
  uri: string;
}

export interface Role {
  branch_id: string;
  name: string;
  password?: string;
  protected: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListRolesResponse {
  roles: Role[];
}

export interface CreateRoleRequest {
  role: {
    name: string;
  };
}

export interface ResetRolePasswordResponse {
  role: Role;
  operations: Operation[];
}
