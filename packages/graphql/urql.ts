import type { Exact } from "type-fest";
import type { OperationContext, OperationResult, RequestPolicy } from "urql";
import type { Client } from "urql";
import {
  type MutationGenqlSelection,
  type MutationResult,
  type QueryGenqlSelection,
  type QueryResult,
  generateMutationOp,
  generateQueryOp,
} from "./genql";

export function typedQuery<
  Query extends Exact<QueryGenqlSelection, Query> & { __name?: string },
>(opts: {
  client: Client;
  query: Query;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
}) {
  const { query, variables } = generateQueryOp(opts.query);
  return opts.client
    .query<QueryResult<Query>>(query, variables, opts.context)
    .toPromise();
}

export async function typedMutation<
  Mutation extends MutationGenqlSelection,
  Data extends MutationResult<Mutation>,
>(opts: {
  client: Client;
  mutation: Mutation;
  context?: Partial<OperationContext>;
}): Promise<OperationResult<Data>> {
  const { query, variables } = generateMutationOp(opts.mutation);
  return opts.client.mutation<Data>(query, variables, opts.context).toPromise();
}
