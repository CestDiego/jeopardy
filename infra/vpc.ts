export const vpc = new sst.aws.Vpc("MyVpc", { bastion: true, nat: "managed" });
