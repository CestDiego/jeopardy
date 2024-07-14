import { builder } from "../builder";

type Data = {
  response: string;
};

const DataType = builder.objectRef<Data>("Data").implement({
  fields: (t) => ({
    response: t.exposeString("response"),
    red: t.exposeString("response"),
  }),
});

builder.queryFields((t) => ({
  clients: t.field({
    type: DataType,
    resolve: () => {
      return { response: "hi" };
    },
  }),
}));

builder.mutationFields((t) => ({
  submitStuff: t.field({
    type: DataType,
    resolve: () => {
      return { response: "submitted" };
    },
  }),
}));
