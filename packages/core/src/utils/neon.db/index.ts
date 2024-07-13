// index.ts
import { isPRStage } from "@onde-vamos/shared/utils";
import { deleteBranchByName, getOrCreateBranch } from "./utils";

export async function runScript(functionToExecute: string) {
  switch (functionToExecute) {
    case "get":
      return getOrCreateBranch();
    case "prepare-pr-branch":
      if (!isPRStage()) {
        console.log("🐒 Not a PR branch, skipping");
        return Promise.resolve("🐒 Not a PR branch, skipping");
      }
      return await getOrCreateBranch();
    case "reset":
      return getOrCreateBranch({ resetBranch: true });
    case "delete":
      return deleteBranchByName();
    default:
      throw new Error("Invalid function name");
  }
}

// Check if the script is being run directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Run the script with the actual process.argv
  runScript(process.argv[2]).then(console.log).catch(console.error);
}
