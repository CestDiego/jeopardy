// index.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { runScript } from "./index";

vi.mock("@onde-vamos/shared/utils", () => ({
  isPRStage: vi.fn(),
}));

vi.mock("./utils", () => ({
  getOrCreateBranch: vi.fn(),
  deleteBranchByName: vi.fn(),
}));

vi.mock("./client", () => ({
  NeonClient: vi.fn().mockImplementation(() => ({
    listProjects: vi
      .fn()
      .mockResolvedValue({ projects: [{ name: "OndeDev", id: "project-id" }] }),
    listBranches: vi.fn().mockResolvedValue({
      branches: [
        { id: "branch-id-1", name: "main", current_state: "ready" },
        { id: "branch-id-2", name: "staging", current_state: "ready" },
        {
          id: "branch-id-3",
          name: "dev/feature-branch",
          current_state: "ready",
        },
      ],
    }),
    createBranch: vi.fn().mockResolvedValue({
      id: "new-branch-id",
      name: "new-branch",
      current_state: "ready",
    }),
    getConnectionUri: vi.fn().mockResolvedValue({ uri: "mock-uri" }),
  })),
}));

describe("Script", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return the result of getOrCreateBranch when the function is 'get'", async () => {
    const { getOrCreateBranch } = await import("./utils");
    getOrCreateBranch.mockResolvedValueOnce("Mocked branch");
    const result = await runScript("get");
    expect(getOrCreateBranch).toHaveBeenCalledWith();
    expect(result).toBe("Mocked branch");
  });

  it("should return the result of getOrCreateBranch when the function is 'prepare-pr-branch' and isPRStage returns true", async () => {
    const { getOrCreateBranch } = await import("./utils");
    const { isPRStage } = await import("@onde-vamos/shared/utils");
    getOrCreateBranch.mockResolvedValueOnce({
      id: "mocked-id",
      name: "Mocked branch",
      uri: "mocked-uri",
    });
    isPRStage.mockReturnValueOnce(true);
    const result = await runScript("prepare-pr-branch");
    expect(isPRStage).toHaveBeenCalled();
    expect(getOrCreateBranch).toHaveBeenCalledWith();
    expect(result).toEqual({
      id: "mocked-id",
      name: "Mocked branch",
      uri: "mocked-uri",
    });
  });

  it("should return a resolved promise with a specific message when the function is 'prepare-pr-branch' and isPRStage returns false", async () => {
    const { getOrCreateBranch } = await import("./utils");
    const { isPRStage } = await import("@onde-vamos/shared/utils");
    isPRStage.mockReturnValueOnce(false);
    const result = await runScript("prepare-pr-branch");
    expect(isPRStage).toHaveBeenCalled();
    expect(getOrCreateBranch).not.toHaveBeenCalled();
    expect(result).toBe("🐒 Not a PR branch, skipping");
  });

  it("should return the result of getOrCreateBranch with resetBranch: true when the function is 'reset'", async () => {
    const { getOrCreateBranch } = await import("./utils");
    getOrCreateBranch.mockResolvedValueOnce("Mocked branch");
    const result = await runScript("reset");
    expect(getOrCreateBranch).toHaveBeenCalledWith({ resetBranch: true });
    expect(result).toBe("Mocked branch");
  });

  it("should return the result of deleteBranchByName when the function is 'delete'", async () => {
    const { deleteBranchByName } = await import("./utils");
    deleteBranchByName.mockResolvedValueOnce("Deleted branch");
    const result = await runScript("delete");
    expect(deleteBranchByName).toHaveBeenCalled();
    expect(result).toBe("Deleted branch");
  });

  it("should throw an error when an invalid function name is provided", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error");
    try {
      await runScript("invalid").catch(() => {});
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe("Invalid function name");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid function name");
    }
  });

  it("should propagate errors thrown by getOrCreateBranch", async () => {
    const { getOrCreateBranch } = await import("./utils");
    const mockedError = new Error("Mocked error");
    getOrCreateBranch.mockRejectedValueOnce(mockedError);
    await expect(runScript("get")).rejects.toThrow(mockedError);
  });

  it("should propagate errors thrown by deleteBranchByName", async () => {
    const { deleteBranchByName } = await import("./utils");
    const mockedError = new Error("Mocked error");
    deleteBranchByName.mockRejectedValueOnce(mockedError);
    await expect(runScript("delete")).rejects.toThrow(mockedError);
  });
});
