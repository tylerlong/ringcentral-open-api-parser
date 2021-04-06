import {OpenAPIV3} from 'openapi-types';
import R from 'ramda';

import {Path} from './types';

export const parsePaths = (doc: OpenAPIV3.Document): Path[] => {
  let result: Path[] = [];
  const paths = Object.keys(doc.paths);
  for (const item of paths) {
    const pathContent = doc.paths[item]! as {
      [key: string]: OpenAPIV3.OperationObject & {[key: string]: string};
    };
    const endpoint = item
      .replace(/\/restapi\/v1\.0\//, '/restapi/{apiVersion}/')
      .replace(/\/scim\/v2/, '/scim/{version}')
      .replace(/\/\.search/, '/dotSearch');
    const path: Path = {
      endpoint,
      paths: endpoint.split('/').filter(t => t !== '' && !t.startsWith('{')),
      operations: [],
    };
    if (endpoint.endsWith('}')) {
      path.parameter = endpoint.split('/').slice(-1)[0].slice(1, -1);
      const matchingResult = R.find(
        r =>
          r.endpoint ===
          endpoint.substring(0, endpoint.length - path.parameter!.length - 3),
        result
      );
      if (matchingResult) {
        path.operations = matchingResult.operations;
      }
      result = result.filter(
        r =>
          r.endpoint !==
          endpoint.substring(0, endpoint.length - path.parameter!.length - 3)
      );
    }
    result.push(path);
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (method in pathContent) {
        const operation = pathContent[method];
        path.operations.push({
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
  result.sort((item1, items2) =>
    item1.endpoint.length > items2.endpoint.length ? 1 : -1
  );
  return result;
};
