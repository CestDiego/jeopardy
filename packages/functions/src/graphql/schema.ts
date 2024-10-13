import { builder } from './builder';

import './types/batches';  // This imports and executes the Pothos definitions

export const schema = builder.toSchema({});
