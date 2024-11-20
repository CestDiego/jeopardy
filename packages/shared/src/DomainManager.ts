import type { StackName } from "./validators";
import { STACK_NAMES, StackNameSchema } from "./validators";

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
  baseDomain: "jeopardy.marcawasi.com",
  subdomainPatterns: {
    cdn: "cdn.{stage}",
    api: "api.{stage}",
    ai: "ai.{stage}",
    web: "{stage}",
    ws: "ws.{stage}",
    electric: "electric.{stage}",
  },
  localPorts: {
    web: 5173,
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

  getDomain(stack: StackName): string {
    // fail fast if stack is not valid
    StackNameSchema.parse(stack);

    // For personal stages, use localhost for any stack with localPort configured
    if (this.isPersonalStage() && this.config.localPorts?.[stack]) {
      const port = this.config.localPorts[stack];
      return `localhost:${port}`;
    }

    // For production WEB, use base domain directly
    if (this.stage === "prod" && stack === "web") {
      return this.config.baseDomain;
    }

    // For non-prod WEB, prefix with stage
    if (stack === "web") {
      return `${this.stage}.${this.config.baseDomain}`;
    }

    // For all other stacks, use standard subdomain pattern
    const pattern =
      this.config.subdomainPatterns?.[stack] || `${stack}.{stage}`;
    const subdomain = pattern.replace(
      "{stage}",
      this.isPersonalStage() ? `${this.stage}.dev` : this.stage,
    );

    // For production, don't include stage in subdomain
    if (this.stage === "prod") {
      return `${stack}.${this.config.baseDomain}`;
    }

    return `${subdomain}.${this.config.baseDomain}`;
  }

  getAllDomains(): Record<StackName, string> {
    return STACK_NAMES.reduce(
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
