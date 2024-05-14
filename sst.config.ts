/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "rukuma",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
      providers: { cloudflare: true },
    };
  },
  async run() {
    const bucket = new sst.cloudflare.Bucket("RukumaBucket");
    const worker = new sst.cloudflare.Worker("RukumaApi", {
      link: [bucket],
      handler: "packages/functions/src/api.ts",
      url: true,
      live: false
    });

    return {
      api: worker.url,
    };
  },
});
