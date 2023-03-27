import { isEqual, last, remove, isEmpty } from 'lodash';
import { OpenAPIV3 } from 'openapi-types';

import { Path, ResponseSchema } from '../types';
import { lowerCaseFirstLetter } from '../utils';

export const getEndpointPaths = (doc: OpenAPIV3.Document) => {
  const entries = Object.entries(doc.paths).sort((item1, item2) => (item1[0].length > item2[0].length ? 1 : -1));

  const result: Path[] = [];

  for (const [key, value] of entries) {
    const pathContent = value as {
      [key: string]: OpenAPIV3.OperationObject & { [key: string]: string };
    };
    const endpoint = getEndpoint(key);
    const path: Path = {
      paths: endpoint.split('/').filter((t) => t !== '' && !t.startsWith('{')),
      operations: [],
    };
    if (endpoint.endsWith('}')) {
      path.parameter = endpoint.split('/').slice(-1)[0].slice(1, -1);
      const name = last(path.paths);
      switch (name) {
        case 'account':
        case 'extension':
          path.defaultParameter = '~';
          break;
        case 'restapi':
          path.defaultParameter = 'v1.0';
          break;
        default:
          break;
      }
      const matchingResult = result.find((r) => isEqual(r.paths, path.paths));
      if (matchingResult) {
        path.operations = matchingResult.operations;
        if ('get' in pathContent) {
          const getOperation = path.operations.find((o) => o.method2 === 'get');
          if (getOperation) {
            getOperation.method2 = 'list';
          }
        }
        if ('delete' in pathContent) {
          const deleteOperation = path.operations.find((o) => o.method2 === 'delete');
          if (deleteOperation) {
            deleteOperation.method2 = 'deleteAll';
          }
        }
      }
      remove(result, (r) => isEqual(r.paths, path.paths));
    }
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (!(method in pathContent)) {
        continue;
      }
      const operation = pathContent[method];
      if (operation.deprecated === true) {
        continue;
      }

      // responseSchema
      const responseSchema = getResponseSchema(operation.responses!);

      // queryParameters
      let queryParameters: string | undefined;
      if (operation.parameters?.some((p) => (p as OpenAPIV3.ParameterObject).in === 'query')) {
        queryParameters = `${operation.operationId}Parameters`;
      }

      // bodyParameters
      const { bodyParameters, formUrlEncoded, multipart } = getBodyParameters(operation);

      path.operations.push({
        endpoint,
        method,
        tags: operation.tags,
        method2: method,
        description: operation.description,
        summary: operation.summary,
        operationId: operation.operationId!,
        rateLimitGroup: operation['x-throttling-group'],
        appPermission: operation['x-app-permission'],
        userPermission: operation['x-user-permission'],
        withParameter: endpoint.endsWith('}'),
        responseSchema,
        queryParameters,
        bodyParameters,
        formUrlEncoded,
        multipart,
      });
    }
    if (path.operations.length > 0) {
      result.push(path);
    }
  }
  return result;
};

const getEndpoint = (key: string) =>
  key
    .replace(/\/restapi\/v1\.0\//, '/restapi/{apiVersion}/')
    .replace(/\/scim\/v2/, '/scim/{version}')
    .replace(/\/team-messaging\/v1/, '/team-messaging/{version}')
    .replace(/\/analytics\/calls\/v1/, '/analytics/calls/{version}')
    .replace(/\/rcvideo\/v1/, '/rcvideo/{version}')
    .replace(/\/\.search/, '/dotSearch');

const getResponseSchema = (responses: OpenAPIV3.ResponsesObject) => {
  const responseContent = (
    (responses[200] ||
      responses[201] ||
      responses[202] ||
      responses[204] ||
      responses[205] ||
      responses[302] ||
      responses[501] ||
      responses.default) as OpenAPIV3.ResponseObject
  ).content;
  let responseSchema: ResponseSchema | undefined;
  if (responseContent && !isEmpty(responseContent)) {
    responseSchema = responseContent[Object.keys(responseContent)[0]].schema;
    if (responseSchema?.$ref) {
      responseSchema.$ref = responseSchema?.$ref.split('/').pop();
    }
  }
  return responseSchema;
};

const getBodyParameters = (operation: OpenAPIV3.OperationObject) => {
  // bodyParameters
  let bodyParameters: string | undefined;
  let formUrlEncoded: boolean | undefined;
  let multipart: boolean | undefined;
  if (operation.requestBody) {
    const requestContent = (operation.requestBody as OpenAPIV3.RequestBodyObject).content;
    const mediaTypeObject =
      requestContent['application/x-www-form-urlencoded'] || requestContent['multipart/form-data'];
    if (mediaTypeObject) {
      if (requestContent['application/x-www-form-urlencoded']) {
        formUrlEncoded = true;
      } else {
        multipart = true;
      }
      const refObj = mediaTypeObject.schema as OpenAPIV3.ReferenceObject;
      if (refObj.$ref) {
        bodyParameters = refObj.$ref.split('/').pop();
      } else {
        bodyParameters = `${operation.operationId}Request`;
      }
    } else {
      const refObj = requestContent[Object.keys(requestContent)[0]].schema as OpenAPIV3.ReferenceObject;
      if (refObj.$ref) {
        bodyParameters = lowerCaseFirstLetter(refObj.$ref!.split('/').pop()!);
      } else {
        // inline json request body schema
        bodyParameters = `${operation.operationId}Request`;
      }
    }
  }
  return { bodyParameters, formUrlEncoded, multipart };
};
