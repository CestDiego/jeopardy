/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    RukumaBucket: import("@cloudflare/workers-types").R2Bucket
  }
}
export {}