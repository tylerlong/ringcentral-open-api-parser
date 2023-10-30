import type { OpenAPIV3 } from 'openapi-types';

import { getEndpointPaths } from './endpoints';
import { getBridgePaths } from './bridges';
import { handleSpecialCases } from './special-cases';
import type { Model } from '../types';

export const preparePaths = (doc: OpenAPIV3.Document, models: Model[]) => {
  const endpointPaths = getEndpointPaths(doc, models);
  const bridgePaths = getBridgePaths(endpointPaths);
  let result = [...endpointPaths, ...bridgePaths].sort((path1, path2) =>
    path1.paths.join('/').length > path2.paths.join('/').length ? 1 : -1,
  );
  result = handleSpecialCases(result);
  return result;
};
