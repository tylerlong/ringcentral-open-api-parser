import {OpenAPIV3} from 'openapi-types';
import R from 'ramda';

import {Path} from './types';

export const parsePaths = (doc: OpenAPIV3.Document): Path[] => {
  let result: Path[] = [];
  const paths = Object.keys(doc.paths).sort((item1, item2) =>
    item1.length > item2.length ? 1 : -1
  );
  for (const item of paths) {
    const pathContent = doc.paths[item]! as {
      [key: string]: OpenAPIV3.OperationObject & {[key: string]: string};
    };
    const endpoint = item
      .replace(/\/restapi\/v1\.0\//, '/restapi/{apiVersion}/')
      .replace(/\/scim\/v2/, '/scim/{version}')
      .replace(/\/\.search/, '/dotSearch');
    const path: Path = {
      paths: endpoint.split('/').filter(t => t !== '' && !t.startsWith('{')),
      operations: [],
    };
    if (endpoint.endsWith('}')) {
      path.parameter = endpoint.split('/').slice(-1)[0].slice(1, -1);
      const matchingResult = R.find(r => R.equals(r.paths, path.paths), result);
      if (matchingResult) {
        path.operations = matchingResult.operations;
      }
      result = result.filter(r => !R.equals(r.paths, path.paths));
    }
    result.push(path);
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (method in pathContent) {
        const operation = pathContent[method];
        path.operations.push({
          endpoint,
          method,
          description: operation.description,
          summary: operation.summary,
          operationId: operation.operationId!,
          rateLimitGroup: operation['x-throttling-group'],
          appPermission: operation['x-app-permission'],
          userPermission: operation['x-user-permission'],
          withParameter: endpoint.endsWith('}'),
        });
      }
    }
  }
  const bridgePaths: Path[] = [];
  for (const item of result) {
    for (let i = 1; i < item.paths.length; i++) {
      const subPaths = item.paths.slice(0, i);
      if (
        !R.find(r => R.equals(r.paths, subPaths), bridgePaths) &&
        !R.find(r => R.equals(r.paths, subPaths), result)
      ) {
        bridgePaths.push({
          paths: subPaths,
          operations: [],
        });
      }
    }
  }
  return [...result, ...bridgePaths];
};
