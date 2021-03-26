import {OpenAPIV3} from 'openapi-types';
import {Path} from './types';

export const parsePaths = (doc: OpenAPIV3.Document) => {
  const result = [];
  const paths = Object.keys(doc.paths);
  for (const item of paths) {
    const pathContent = doc.paths[item]!;
    const endpoint = item
      .replace(/\/restapi\/v1\.0\//, '/restapi/{apiVersion}/')
      .replace(/\/scim\/v2/, '/scim/{version}')
      .replace(/\/\.search/, '/dotSearch');
    const path: Path = {
      endpoint,
      paths: endpoint.split('/').filter(t => t !== '' && !t.startsWith('{')),
      operations: [],
    };
    result.push(path);
    if (endpoint.endsWith('}')) {
      path.parameter = endpoint.split('/').slice(-1)[0].slice(1, -1);
    }
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (method in pathContent) {
        path.operations.push({method});
      }
    }
  }
  result.sort((item1, items2) =>
    item1.endpoint.length > items2.endpoint.length ? 1 : -1
  );
  return result;
};
