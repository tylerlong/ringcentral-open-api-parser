import type { OpenAPIV3 } from 'openapi-types';

import type { NamedSchema, RawOperation } from '../../types';
import { collectRequestBodies } from './request-bodies';
import { collectQueryParams } from './query-params';
import { collectSchemas } from './schemas';
import { handleSpecialCases } from './special-cases';
import { collectResponses } from './responses';

export const collect = (doc: OpenAPIV3.Document, operations: RawOperation[]) => {
  const schemas: NamedSchema[] = [];
  schemas.push(...handleSpecialCases());
  schemas.push(...collectQueryParams(doc, operations));
  schemas.push(...collectRequestBodies(operations));
  schemas.push(...collectSchemas(doc));
  schemas.push(...collectResponses(doc));
  return schemas;
};
