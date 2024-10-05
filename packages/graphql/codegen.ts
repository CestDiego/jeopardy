import type { CodegenConfig } from "@graphql-codegen/cli";
import { printSchema } from "graphql";
import { schema } from "../functions/src/graphql/schema";

const config: CodegenConfig = {
  schema: printSchema(schema),
  generates: {
    "schema.graphql": {
      plugins: ["schema-ast"],
      hooks: {
        afterOneFileWrite: ["npx @genql/cli --esm --output ./genql --schema"],
      },
    },
  },
};

export default config;
