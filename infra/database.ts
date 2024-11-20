// NEON_API_KEY needs to be set in .env or read from SST secret
// NEON_PROJECT_ID needs to be set in .env or read from SST secret

import { isPermanentStage } from "./stage";

if (!process.env.NEON_API_KEY) {
  // Throw error now because Neon provider gives cryptic error messages when NEON_API_KEY is not set
  throw new Error("NEON_API_KEY env var is not set");
}

if (!process.env.NEON_PROJECT_ID) {
  throw new Error("NEON_PROJECT_ID env var is not set");
}

const APP_DATABASE_NAME = "jeopardy";
const PROJECT_ID = process.env.NEON_PROJECT_ID;


// Project is the container for all stage-specific branches
const project = neon.getProjectOutput({ id: PROJECT_ID });
const sourceBranchId = project.defaultBranchId;

// TODO how to protect certain branches from accidental deletion?
// Create/Get stage-specific branch
const branchName = isPermanentStage ? $app.stage : `dev-${$app.stage}`;
const branch =
  $app.stage !== "production"
    ? new neon.Branch("DbBranch", {
        projectId: PROJECT_ID,
        parentId: sourceBranchId,
        name: branchName,
      })
    : neon.getBranchesOutput({
        projectId: PROJECT_ID,
        id: sourceBranchId,
      });

// TODO do need to avoid creating this for production branch?
const endpoint = new neon.Endpoint("DbEndpoint", {
  projectId: PROJECT_ID,
  branchId: branch.id,
});

export const adminRole = new neon.Role("DbAdminRole", {
  projectId: PROJECT_ID,
  branchId: branch.id,
  name: "app_admin",
});

const database = new neon.Database("AppDatabase", {
  ownerName: adminRole.name,
  projectId: PROJECT_ID,
  branchId: branch.id,
  name: APP_DATABASE_NAME,
});

// Expose created credentials as linkables

export const sharedDbProperties = {
  host: endpoint.host,
  database: APP_DATABASE_NAME,
};

export const dbAppUserCreds = new sst.Linkable("DbAppUserCreds", {
  properties: {
    ...sharedDbProperties,
    // TODO should use the appUserRole credentials here once work out granting permissions
    // username: appUserRole.name,
    // password: appUserRole.password,
    username: adminRole.name,
    password: adminRole.password,
  },
});

export const dbMigrationsUserCreds = new sst.Linkable("DbMigrationsUserCreds", {
  properties: {
    ...sharedDbProperties,
    username: adminRole.name,
    password: adminRole.password,
  },
});

export const neonDb = new sst.Linkable("NeonDb", {
  properties: {
    host: endpoint.host,
    neonBranchId: branch.id,
    neonBranchName: branchName,
  },
});