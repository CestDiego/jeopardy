// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    ID: string,
    Float: number,
    Int: number,
    Boolean: boolean,
}

export interface Batch {
    error: (Scalars['String'] | null)
    id: (Scalars['ID'] | null)
    results: (Scalars['String'] | null)
    status: (Scalars['String'] | null)
    __typename: 'Batch'
}

export interface CreateBatchPayload {
    batchId: (Scalars['ID'] | null)
    __typename: 'CreateBatchPayload'
}

export interface Mutation {
    createBatch: (CreateBatchPayload | null)
    __typename: 'Mutation'
}

export interface Query {
    batch: (Batch | null)
    __typename: 'Query'
}

export interface BatchGenqlSelection{
    error?: boolean | number
    id?: boolean | number
    results?: boolean | number
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface BatchParametersInput {model?: (Scalars['String'] | null),temperature?: (Scalars['Float'] | null)}

export interface CreateBatchPayloadGenqlSelection{
    batchId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    createBatch?: (CreateBatchPayloadGenqlSelection & { __args: {batchSize: Scalars['Int'], fileUrl: Scalars['String'], parameters?: (BatchParametersInput | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    batch?: (BatchGenqlSelection & { __args: {id: Scalars['ID']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Batch_possibleTypes: string[] = ['Batch']
    export const isBatch = (obj?: { __typename?: any } | null): obj is Batch => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBatch"')
      return Batch_possibleTypes.includes(obj.__typename)
    }
    


    const CreateBatchPayload_possibleTypes: string[] = ['CreateBatchPayload']
    export const isCreateBatchPayload = (obj?: { __typename?: any } | null): obj is CreateBatchPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateBatchPayload"')
      return CreateBatchPayload_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    