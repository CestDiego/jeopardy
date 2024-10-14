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
    [STACK_NAMES.WEB]: 5173,
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
      this.stage !== "prod" &&
      !this.stage.match(/^pr\d+$/)
    );
  }

  getDomain(stackName: StackName): string {
    const baseDomain = this.config.baseDomain;
    let subdomain = '';

    if (this.stage === "prod") {
      // For the production stage, use a clean subdomain like 'cdn.baseDomain'
      subdomain = stackName;
    } else if (this.isPersonalStage()) {
      // For personal stages, handle local development and domain patterns
      const localPort = this.config.localPorts?.[stackName];
      if (localPort) {
        subdomain = `localhost:${localPort}`;
      } else {
        subdomain = `${stackName}.${this.stage}.dev`;
      }
    } else {
      // For other stages like 'dev' or 'pr123', use the default pattern
      subdomain = `${stackName}.${this.stage}`;
    }

    return `${subdomain}.${baseDomain}`.replace(/^\./, "");
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
