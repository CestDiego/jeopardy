import NeonDBUtils from "../packages/core/src/utils/neon.db/utils";
import { allSecrets } from "./secret";

const databaseString = $resolve([allSecrets.NEON_API_KEY.value]).apply(
  async ([neonApiKey]) => {
    if (!neonApiKey) throw new Error("NEON_API_KEY is required");

    const neonDBUtils = new NeonDBUtils({
      neonApiKey,
      config: {
        roleName: "neondb_owner",
        dbName: "neondb",
        projectName: "Rukuma",
      },
      stage: $app.stage,
    });
    const databaseString = await neonDBUtils.getDatabaseString();
    return { primary: databaseString, replicas: [] };
  },
);
export const DATABASE_CONNECTIONS = new sst.Linkable("DATABASE_CONNECTIONS", {
  properties: databaseString,
});

new command.local.Command("Test", {
  create: "touch diddy.log",
  dir: $asset("packages/core").path,
});
// const branch = await getOrCreateBranch()
// console.log({ branch }, 'Branch from Neon')
