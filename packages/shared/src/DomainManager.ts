import type { App } from "@pulumi/aws/sagemaker";

// Constants for stack names
export const STACK_NAMES = {
  CDN: "cdn",
  API: "api",
  WEB: "web",
  AI: "ai",
  // Add more stack names as needed
} as const;

type StackName = typeof STACK_NAMES[keyof typeof STACK_NAMES];

interface DomainConfig {
  baseDomain: string;
  subdomainPatterns: {
    [key in StackName]: string;
  };
  localPorts?: Partial<{
    [key in StackName]: number;
  }>;
}

const defaultConfig: DomainConfig = {
  baseDomain: "rukuma.marcawasi.com",
  subdomainPatterns: {
    [STACK_NAMES.CDN]: "cdn.{stage}",
    [STACK_NAMES.API]: "api.{stage}",
    [STACK_NAMES.AI]: "ai.{stage}",
    [STACK_NAMES.WEB]: "{stage}",
  },
  localPorts: {
    [STACK_NAMES.API]: 4000,
    [STACK_NAMES.WEB]: 5173,  // Vite's default port
  },
};

export class DomainManager {
  private stage: string;
  private appName: string;
  private config: DomainConfig;

  constructor(stage: string, appName: string, config?: Partial<DomainConfig>) {
    this.stage = stage;
    this.appName = appName;
    this.config = { ...defaultConfig, ...config };
  }

  private isPersonalStage(): boolean {
    return (
      this.stage !== "dev" &&
      this.stage !== "production" &&
      !this.stage.match(/^pr\d+$/)
    );
  }

  getDomain(stackName: StackName): string {
    if (this.stage === "local") {
      const localPort = this.config.localPorts?.[stackName];
      if (localPort) {
        return `localhost:${localPort}`;
      }
      // If no local port is specified, fall back to the regular domain generation
    }

    const pattern = this.config.subdomainPatterns[stackName];
    let subdomain = pattern.replace("{stage}", this.stage);

    if (this.isPersonalStage()) {
      subdomain = `${this.stage}.${subdomain}`;
    }

    if (this.stage === "production") {
      subdomain = subdomain.replace(/^[^.]+\./, "");
    }

    return `${subdomain}.${this.config.baseDomain}`.replace(/^\./, "");
  }

  getAllDomains(): Record<StackName, string> {
    return Object.values(STACK_NAMES).reduce(
      (acc, stackName) => {
        acc[stackName] = this.getDomain(stackName);
        return acc;
      },
      {} as Record<StackName, string>,
    );
  }

  static fromSst(app: {
    name: string;
    stage: string;
  }): DomainManager {
    return new DomainManager(app.stage, app.name);
  }
}
