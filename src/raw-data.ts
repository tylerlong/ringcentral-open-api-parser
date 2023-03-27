import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';

import { RawOperation } from './types';

export const getRawData = (filePath: string) => {
  const doc = load(readFileSync(filePath, 'utf8')) as OpenAPIV3.Document;
  const operations: RawOperation[] = [];
  Object.values(doc.paths).forEach((pathObject) => {
    Object.values(pathObject!).forEach((ops) => {
      operations.push(ops as RawOperation);
    });
  });
  return { doc, operations };
};
