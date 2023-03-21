import { OpenAPIV3 } from 'openapi-types';

import { ParseResult } from './types';
import { parseModels } from './models';
import { parsePaths } from './paths';
import adjust from './adjust/index';

export const parse = (_doc: OpenAPIV3.Document): ParseResult => {
  const doc = adjust(_doc);
  return {
    models: parseModels(doc),
    paths: parsePaths(doc),
  };
};
