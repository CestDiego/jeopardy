import { exec } from "node:child_process";
import chalk from "chalk";
import * as chokidar from "chokidar";

async function generateSchema() {
  exec("tsx scripts/pothos-extract.ts");
}

function runGenQL() {
  exec(
    "cd packages/graphql && npx @genql/cli --output ./genql --schema ./schema.graphql --esm",
    (error, stdout, stderr) => {
      if (error) {
        // biome-ignore lint:
        console.error(`exec error: ${error}`);
        return;
      }
      // // biome-ignore lint:
      // console.log(`GenQL output: ${stdout}`);
      // biome-ignore lint:
      if (stderr) console.error(`GenQL errors: ${stderr}`);
    },
  );
}

async function build() {
  try {
    await generateSchema();
    // biome-ignore lint:
    console.log(chalk.green("✔"), "Pothos: Extracted pothos schema");
    runGenQL();
    // biome-ignore lint:
  } catch (ex: any) {
    // biome-ignore lint:
    console.log(chalk.red(`✖`), " Pothos: Failed to extract schema:");
    for (const line of ex.message.split("\n")) {
      // biome-ignore lint:
      console.log("  ", line);
    }
  }
}

// Initial build
build();

// Watch for changes
chokidar.watch("packages/functions/src/graphql/**/*.ts").on("change", (_event, path) => {
  build();
});
