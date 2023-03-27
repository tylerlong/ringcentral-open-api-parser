import { OpenAPIV3 } from 'openapi-types';

import { collect } from './collect';
import { adjust } from './adjust';
import { normalize } from './normalize';
import { RawOperation } from '../types';

export const prepareModels = (doc: OpenAPIV3.Document, operations: RawOperation[]) => {
  const r = collect(doc, operations);
  const r2 = adjust(r, doc);
  return normalize(r2);
};
