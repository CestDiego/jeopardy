/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    AiEndpoint: {
      name: string
      type: "sst.aws.Function"
      url: string
    }
    Api: {
      name: string
      type: "sst.aws.Function"
      url: string
    }
    Auth: {
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