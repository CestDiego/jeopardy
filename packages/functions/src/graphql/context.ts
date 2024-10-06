import { AsyncLocalStorage } from "node:async_hooks";
import type {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyEventMultiValueQueryStringParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyWebsocketEventV2,
  Context as LambdaContext,
  SQSBatchResponse,
  SQSEvent,
} from "aws-lambda";

export class ContextNotFoundError extends Error {
  constructor(public override name: string) {
    super(
      `${name} context was not provided. It is possible you have multiple versions of SST installed.`,
    );
  }
}

export type Context<T> = ReturnType<typeof create<T>>;

let count = 0;
export function create<T>(name: string) {
  const storage = new AsyncLocalStorage<{
    value: T;
    version: string;
  }>();

  const children = [] as MemoReset[];
  // notify all memos to reset
  function reset() {
    for (const child of children) {
      child();
    }
  }

  const ctx = {
    name,
    with<R>(value: T, cb: () => R) {
      const version = (++count).toString();
      return storage.run({ value, version }, () => {
        return runWithCleanup(cb, () => reset());
      });
    },
    use() {
      const memo = ContextMemo.getStore();
      // use is being called within a memo, so track dependency
      if (memo) {
        memo.deps.push(ctx);
        children.push(memo.reset);
      }
      const result = storage.getStore();
      if (result === undefined) throw new ContextNotFoundError(name);
      return result.value;
    },
    version() {
      const result = storage.getStore();
      if (result === undefined) throw new ContextNotFoundError(name);
      return result.version;
    },
  };
  return ctx;
}

interface Trackable {
  version(): string;
}

type MemoReset = () => void;
const ContextMemo = new AsyncLocalStorage<{
  reset: MemoReset;
  deps: Trackable[];
}>();

export function memo<T>(cb: () => T) {
  const deps = [] as Trackable[];
  const cache = new Map<string, T>();
  const children = [] as MemoReset[];
  let tracked = false;

  function key() {
    return deps.map((dep) => dep.version()).join(",");
  }

  function reset() {
    cache.delete(key());
    for (const child of children) {
      child();
    }
  }

  function save(value: T) {
    cache.set(key(), value);
  }

  return () => {
    const child = ContextMemo.getStore();
    if (child) {
      child.deps.push({ version: () => key() });
      children.push(child.reset);
    }
    // Memo never run so build up dependency list
    if (!tracked) {
      return ContextMemo.run({ deps, reset }, () => {
        return runWithCleanup(cb, (result) => {
          tracked = true;
          save(result);
        });
      });
    }

    const cached = cache.get(key());
    if (cached) {
      return cached;
    }

    const result = cb();
    save(result);
    return result;
  };
}

function runWithCleanup<R>(cb: () => R, cleanup: (input: R) => void): R {
  const result = cb();
  if (
    result &&
    typeof result === "object" &&
    "then" in result &&
    typeof result.then === "function"
  ) {
    return result.then((value: R) => {
      // cleanup
      cleanup(result);
      return value;
    });
  }
  cleanup(result);
  return result;
}

export const Context = {
  create,
  memo,
};

export interface Handlers {
  api: {
    event: APIGatewayProxyEventV2;
    // biome-ignore lint: copied code
    response: APIGatewayProxyStructuredResultV2 | void;
  };
  ws: {
    // These fields are being returned when we print it but for some reason not
    // part of the APIGatewayProxyWebsocketEventV2 type
    event: APIGatewayProxyWebsocketEventV2 & {
      headers?: APIGatewayProxyEventHeaders;
      multiValueHeaders?: APIGatewayProxyEventMultiValueHeaders;
      queryStringParameters?: APIGatewayProxyEventQueryStringParameters | null;
      multiValueQueryStringParameters?: APIGatewayProxyEventMultiValueQueryStringParameters | null;
    };
    response: APIGatewayProxyResultV2;
  };
  sqs: {
    event: SQSEvent;
    response: SQSBatchResponse;
  };
}

export type HandlerTypes = keyof Handlers;

type Requests = {
  [key in HandlerTypes]: {
    type: key;
    event: Handlers[key]["event"];
    context: LambdaContext;
  };
}[HandlerTypes];

const RequestContext = create<Requests>("RequestContext");

export function useContextType(): HandlerTypes {
  const ctx = RequestContext.use();
  return ctx.type;
}

export function useEvent<Type extends HandlerTypes>(type: Type) {
  const ctx = RequestContext.use();
  if (ctx.type !== type) throw new Error(`Expected ${type} event`);
  return ctx.event as Handlers[Type]["event"];
}

export function useLambdaContext() {
  const ctx = RequestContext.use();
  return ctx.context;
}

export function Handler<
  Type extends HandlerTypes,
  Event = Handlers[Type]["event"],
  Response = Handlers[Type]["response"],
>(type: Type, cb: (evt: Event, ctx: LambdaContext) => Promise<Response>) {
  return function handler(event: Event, context: LambdaContext) {
    // biome-ignore lint: copied code
    return RequestContext.with({ type, event: event as any, context }, () =>
      cb(event, context),
    );
  };
}
