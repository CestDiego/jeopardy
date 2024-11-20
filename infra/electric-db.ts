import { vpc } from "./vpc";
import { DATABASE_CONNECTIONS } from "./database";

export const cluster = new sst.aws.Cluster("ElectricDbCluster", {
  vpc,
});

export const electric = cluster.addService("Electric", {
  link: [DATABASE_CONNECTIONS],
  dev: {
    url: "http://localhost:3001",
  },
  containers: [
    {
      name: "electric",
      image: "electricsql/electric",
      environment: {
        DATABASE_URL: DATABASE_CONNECTIONS.properties.primary,
      },
      dev: {
        autostart: true,
        command: "docker run -p 3001:3000 -t electricsql/electric:latest",
      },
    },
  ],
});

export const outputs = {
  cluster: cluster.urn,
  electric: electric.url,
};
