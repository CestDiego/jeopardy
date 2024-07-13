/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    Api: {
      name: string
      type: "sst.aws.Function"
      url: string
    }
    Bucket: {
      name: string
      type: "sst.aws.Bucket"
    }
    Web: {
      type: "sst.aws.Remix"
      url: string
    }
  }
}
export {}
