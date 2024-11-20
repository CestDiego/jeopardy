import { describe, expect, it } from "vitest";
import { DomainManager } from "./DomainManager";
import { STACK_NAMES, type StackName } from "./validators";

describe("DomainManager", () => {
  const baseDomain = "jeopardy.marcawasi.com";

  describe("getDomain", () => {
    // Production environment tests
    it("should generate correct domains for production", () => {
      const manager = new DomainManager("prod", "myapp");

      expect(manager.getDomain("cdn")).toBe(`cdn.${baseDomain}`);
      expect(manager.getDomain("api")).toBe(`api.${baseDomain}`);
      expect(manager.getDomain("web")).toBe(`${baseDomain}`);
      expect(manager.getDomain("ai")).toBe(`ai.${baseDomain}`);
    });

    // Development environment tests
    it("should generate correct domains for dev environment", () => {
      const manager = new DomainManager("dev", "myapp");

      expect(manager.getDomain("web")).toBe(`dev.${baseDomain}`);
      expect(manager.getDomain("cdn")).toBe(`cdn.dev.${baseDomain}`);
      expect(manager.getDomain("api")).toBe(`api.dev.${baseDomain}`);
      expect(manager.getDomain("ai")).toBe(`ai.dev.${baseDomain}`);
    });

    // PR environment tests
    it("should generate correct domains for PR environments", () => {
      const manager = new DomainManager("pr123", "myapp");

      expect(manager.getDomain("web")).toBe(`pr123.${baseDomain}`);
      expect(manager.getDomain("cdn")).toBe(`cdn.pr123.${baseDomain}`);
      expect(manager.getDomain("api")).toBe(`api.pr123.${baseDomain}`);
      expect(manager.getDomain("ai")).toBe(`ai.pr123.${baseDomain}`);
    });

    // Personal stage tests
    it("should generate correct domains for personal stages", () => {
      const manager = new DomainManager("john", "myapp");

      expect(manager.getDomain("web")).toBe("localhost:5173");
      expect(manager.getDomain("cdn")).toBe(`cdn.john.dev.${baseDomain}`);
      expect(manager.getDomain("api")).toBe(`api.john.dev.${baseDomain}`);
      expect(manager.getDomain("ai")).toBe(`ai.john.dev.${baseDomain}`);
    });

    // Custom configuration tests
    it("should respect custom domain configuration", () => {
      const customConfig = {
        baseDomain: "custom.example.com",
        subdomainPatterns: {
          cdn: "static.{stage}",
          api: "backend.{stage}",
          web: "frontend.{stage}",
          ai: "ml.{stage}",
        },
        localPorts: {
          web: 3000,
          api: 4000,
        },
      };

      const manager = new DomainManager("john", "myapp", customConfig);

      expect(manager.getDomain("web")).toBe("localhost:3000");
      expect(manager.getDomain("api")).toBe("localhost:4000");
      expect(manager.getDomain("cdn")).toBe(
        "static.john.dev.custom.example.com",
      );
      expect(manager.getDomain("ai")).toBe("ml.john.dev.custom.example.com");
    });
  });

  describe("getAllDomains", () => {
    it("should return all domains for production", () => {
      const manager = new DomainManager("prod", "myapp");
      const domains = manager.getAllDomains();

      expect(domains).toEqual({
        cdn: `cdn.${baseDomain}`,
        api: `api.${baseDomain}`,
        web: `${baseDomain}`,
        ai: `ai.${baseDomain}`,
      });
    });

    it("should return all domains for personal stage", () => {
      const manager = new DomainManager("john", "myapp");
      const domains = manager.getAllDomains();

      expect(domains).toEqual({
        cdn: `cdn.john.dev.${baseDomain}`,
        api: `api.john.dev.${baseDomain}`,
        web: "localhost:5173",
        ai: `ai.john.dev.${baseDomain}`,
      });
    });
  });

  describe("static fromSst", () => {
    it("should create instance from SST app config", () => {
      const manager = DomainManager.fromSst({
        name: "myapp",
        stage: "dev",
      });

      expect(manager.getDomain("cdn")).toBe(`cdn.dev.${baseDomain}`);
      expect(manager.getDomain("api")).toBe(`api.dev.${baseDomain}`);
    });
  });

  describe("edge cases", () => {
    it("should handle partial config overrides", () => {
      const partialConfig = {
        localPorts: {
          web: 8080,
        },
      };
      const manager = new DomainManager("john", "myapp", partialConfig);
      expect(manager.getDomain("web")).toBe("localhost:8080");
      // Should still use default baseDomain
      expect(manager.getDomain("cdn")).toBe(`cdn.john.dev.${baseDomain}`);
    });

    it("should handle empty stage names", () => {
      const manager = new DomainManager("", "myapp");
      expect(() => manager.getDomain("web")).not.toThrow();
    });

    it("should handle invalid stack names", () => {
      const manager = new DomainManager("dev", "myapp");
      expect(() => manager.getDomain("invalid-stack" as StackName)).toThrow();
    });
  });
});
