import { OpenAPIV3 } from 'openapi-types';

import { getEndpointPaths } from './endpoints';
import { getBridgePaths } from './bridges';
import { handleSpecialCases } from './special-cases';

export const preparePaths = (doc: OpenAPIV3.Document) => {
  const endpointPaths = getEndpointPaths(doc);
  const bridgePaths = getBridgePaths(endpointPaths);
  let result = [...endpointPaths, ...bridgePaths].sort((path1, path2) =>
    path1.paths.join('/').length > path2.paths.join('/').length ? 1 : -1,
  );
  result = handleSpecialCases(result);
  return result;
};
