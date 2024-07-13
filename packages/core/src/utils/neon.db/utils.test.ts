import { describe, expect, it, vi } from "vitest";
import { getBranchForStage, getSourceBranchForStage } from "./utils";

vi.mock("./client", () => {
  return {
    NeonClient: class {
      listProjects() {
        return { projects: [{ name: "OndeDev", id: "project-id" }] };
      }

      listBranches(projectId) {
        return {
          branches: [
            { id: "branch-id-1", name: "main" },
            { id: "branch-id-2", name: "staging" },
            { id: "branch-id-3", name: "dev/feature-branch" },
          ],
        };
      }

      createBranch(projectId, branchConfig) {
        return { id: "new-branch-id", name: branchConfig.branch.name };
      }
    },
  };
});

describe("getSourceBranchForStage", () => {
  it('should return "main" for "prod" stage', () => {
    expect(getSourceBranchForStage("prod")).toBe("main");
  });

  it('should return "main" for "staging" stage', () => {
    expect(getSourceBranchForStage("staging")).toBe("main");
  });

  it('should return "main" for "dev" stage', () => {
    expect(getSourceBranchForStage("dev")).toBe("main");
  });

  it('should return "dev" for any other stage', () => {
    expect(getSourceBranchForStage("pr/123")).toBe("dev");
    expect(getSourceBranchForStage("pr-123")).toBe("dev");
  });
});

describe("getBranchForStage", () => {
  it('should return "ephemeral/pr123" for "pr123" stage', () => {
    expect(getBranchForStage("pr123")).toBe("ephemeral/pr123");
  });

  it('should return "main" for "prod" stage', () => {
    expect(getBranchForStage("prod")).toBe("main");
  });

  it('should return "staging" for "staging" stage', () => {
    expect(getBranchForStage("staging")).toBe("staging");
  });

  it('should return "dev/some-other-stage" for any other stage', () => {
    expect(getBranchForStage("some-other-stage")).toBe("dev/some-other-stage");
  });
});
