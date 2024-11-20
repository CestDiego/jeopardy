import { sharedDbProperties, adminRole } from "./database";
import { vpc } from "./vpc";

export const cluster = new sst.aws.Cluster("ElectricDbCluster", {
  vpc,
});

export const electric = cluster.addService("Electric", {
  loadBalancer: {
    ports: [{ listen: "80/http", forward: "3000/http" }],
  },
  containers: [
    {
      name: "electric",
      image: "electricsql/electric",
      environment: {
        DATABASE_URL: $interpolate`postgres://${adminRole.name}:${adminRole.password}@${sharedDbProperties.host}/${sharedDbProperties.database}`,
      },
      dev: {
        command: $interpolate`docker run -e "DATABASE_URL=postgres://${adminRole.name}:${adminRole.password}@${sharedDbProperties.host}/${sharedDbProperties.database}" -p 3000:3000 -t electricsql/electric:latest`,
      },
    },
  ],
});

export const outputs = {
  cluster: cluster.urn,
  electric: electric.url,
};
