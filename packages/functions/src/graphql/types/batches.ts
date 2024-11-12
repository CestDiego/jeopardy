import { builder } from "../builder";

// Define the BatchParameters input type
const BatchParametersInput = builder.inputType("BatchParametersInput", {
  fields: (t) => ({
    model: t.string(),
    temperature: t.float(),
    // Add more parameters as needed
  }),
});

// Define the Batch type
const BatchType = builder.objectType("Batch", {
  fields: (t) => ({
    id: t.exposeID("id"),
    status: t.exposeString("status"),
    results: t.exposeString("results", { nullable: true }),
    error: t.exposeString("error", { nullable: true }),
  }),
});

// Define the CreateBatchPayload type
const CreateBatchPayload = builder.objectType("CreateBatchPayload", {
  fields: (t) => ({
    batchId: t.exposeID("batchId"),
  }),
});

// Add the createBatch mutation
builder.mutationField("createBatch", (t) =>
  t.field({
    type: CreateBatchPayload,
    args: {
      batchSize: t.arg.int({ required: true }),
      fileUrl: t.arg.string({ required: true }),
      parameters: t.arg({ type: BatchParametersInput }),
    },
    resolve: async (parent, args, context) => {
      // Here you would implement the logic to create a new batch
      // This might involve:
      // 1. Validating the input
      // 2. Storing the batch information in your database
      // 3. Potentially triggering the batch processing

      // For now, we'll just return a mock batch ID
      const batchId = `batch_${Date.now()}`;

      // In a real implementation, you would save the batch info and return the actual batch ID
      return {
        batchId: batchId,
      };
    },
  }),
);

// Add the batch query
builder.queryField("batch", (t) =>
  t.field({
    type: BatchType,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (parent, args, context) => {
      // Here you would implement the logic to fetch a batch by ID
      // This might involve querying your database

      // For now, we'll just return mock data
      return {
        id: args.id,
        status: "processing",
        results: null,
        error: null,
      };
    },
  }),
);
