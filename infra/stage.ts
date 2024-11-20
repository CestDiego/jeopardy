export const isPermanentStage =
  $app.stage === "production" ||
  $app.stage === "staging" ||
  $app.stage === "test";
