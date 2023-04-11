import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema, RawOperation } from '../../types';
import { collectRequestBodies } from './request-bodies';
import { collectQueryParams } from './query-params';
import { collectSchemas } from './schemas';
import { handleSpecialCases } from './special-cases';

export const collect = (doc: OpenAPIV3.Document, operations: RawOperation[]) => {
  const schemas: NamedSchema[] = [];
  schemas.push(...handleSpecialCases());
  schemas.push(...collectQueryParams(doc, operations));
  schemas.push(...collectRequestBodies(operations));
  schemas.push(...collectSchemas(doc));
  return schemas;
};
