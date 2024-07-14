import * as fs from "node:fs";
import * as path from "node:path";
import url from "node:url";
import { lexicographicSortSchema, printSchema } from "graphql";
import { schema } from "../packages/functions/src/graphql/schema";

const __filename = url.fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
const schemaOutputPath = path.resolve(__dirname, "../packages/graphql/schema.graphql");

async function generateSchema() {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  fs.writeFileSync(schemaOutputPath, schemaString);
}

generateSchema();
