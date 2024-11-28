export const vpc = $dev
  ? sst.aws.Vpc.get("MyVpc", "vpc-06144291f0066e265")
  : new sst.aws.Vpc("MyVpc", { bastion: true, nat: "managed" });
