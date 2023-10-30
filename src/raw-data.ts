import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import type { OpenAPIV3 } from 'openapi-types';

import type { RawOperation } from './types';

export const getRawData = (filePath: string) => {
  const doc = load(readFileSync(filePath, 'utf8')) as OpenAPIV3.Document;
  const operations: RawOperation[] = [];
  Object.values(doc.paths).forEach((pathObject) => {
    Object.values(pathObject!).forEach((_ops) => {
      const ops = _ops as RawOperation;
      // Resolve $ref in requset bodies
      if (ops.requestBody && '$ref' in ops.requestBody) {
        ops.requestBody = doc.components!.requestBodies![
          (ops.requestBody.$ref as string).split('/').pop()!
        ] as OpenAPIV3.RequestBodyObject;
      }

      // fix some temporary issues
      if (ops.summary === 'Get Scaled Profile Image') {
        ops.deprecated = false;
      }

      operations.push(ops);
    });
  });
  return { doc, operations };
};
