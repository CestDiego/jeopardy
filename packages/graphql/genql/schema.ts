// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    Boolean: boolean,
}

export interface Data {
    red: (Scalars['String'] | null)
    response: (Scalars['String'] | null)
    __typename: 'Data'
}

export interface Mutation {
    submitStuff: (Data | null)
    __typename: 'Mutation'
}

export interface Query {
    clients: (Data | null)
    __typename: 'Query'
}

export interface DataGenqlSelection{
    red?: boolean | number
    response?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    submitStuff?: DataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    clients?: DataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Data_possibleTypes: string[] = ['Data']
    export const isData = (obj?: { __typename?: any } | null): obj is Data => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isData"')
      return Data_possibleTypes.includes(obj.__typename)
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
    