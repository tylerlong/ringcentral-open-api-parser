import {OpenAPIV3} from 'openapi-types';
import parseResult from './parsed.json';

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export type ParseResult = {
  models: Model[];
  paths: Path[];
};
export const parsed: ParseResult = parseResult as ParseResult;

export type Model = {
  name: string;
  description?: string;
  fields: Field[];
};

export type Path = {
  endpoint: string;
  paths: string[];
  parameter?: string;
  operations: Operation[];
};

export type Operation = {
  method: string;
};

export type Field = {
  name: string;
  type?: string;
  $ref?: string;
  description?: string;
  enum?: string[];
  example?: string;
  format?: string;
  items?: Field;
  default?: string | boolean;
  minimum?: number;
  maximum?: number;
  required?: boolean;
};

export type SchemaDict = {
  [key: string]: OpenAPIV3.SchemaObject;
};

const normalizeField = (field: Field): Field => {
  if (field.$ref) {
    field.$ref = field.$ref.split('/').slice(-1)[0];
  }
  if (
    field.type === 'file' ||
    (field.type === 'string' && field.format === 'binary')
  ) {
    field.$ref = 'Attachment';
    delete field.type;
    delete field.format;
  }
  if (field.items) {
    field.items = normalizeField(field.items);
  }
  return field;
};

const normalizeSchema = (
  name: string,
  schema: OpenAPIV3.SchemaObject
): Model => {
  const properties = schema.properties as SchemaDict;
  const fields = Object.keys(properties)
    .map(k => ({
      ...(properties[k] as Field),
      name: k,
      required: schema.required?.includes(k),
    }))
    .map(f => normalizeField(f));
  return {
    name,
    description: schema.description,
    fields,
  };
};

export const parseModels = (doc: OpenAPIV3.Document): Model[] => {
  const schemas = doc.components?.schemas as SchemaDict;
  const models: Model[] = [];

  // doc.components.schemas
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];
    models.push(normalizeSchema(name, schema));
  }

  // Attachment
  models.push({
    name: 'Attachment',
    description: 'Attachment is a file to be uploaded',
    fields: [
      {
        name: 'filename',
        type: 'string',
        description: 'Filename with extension',
        example: 'example.png',
      },
      {
        name: 'content',
        type: 'byte[]',
        description: 'Binary content of the file',
        required: true,
      },
      {
        name: 'contentType',
        type: 'string',
        description: 'Content type of the file, such as "image/png"',
      },
    ],
  });

  Object.keys(doc.paths).forEach(p => {
    const pathObject = doc.paths[p] as {
      [key: string]: OpenAPIV3.OperationObject;
    };
    Object.keys(pathObject).forEach(method => {
      const operation = pathObject[method];

      // form-data schemas
      const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
      if (requestBody) {
        const mediaTypeObject =
          requestBody.content['application/x-www-form-urlencoded'] ||
          requestBody.content['multipart/form-data'];
        if (mediaTypeObject) {
          const schema = mediaTypeObject.schema!;
          if ('properties' in schema) {
            const name =
              capitalizeFirstLetter(operation.operationId!) + 'Request';
            if (!schema.description) {
              schema.description = `Request body for operation ${operation.operationId}`;
            }
            models.push(
              normalizeSchema(name, schema as OpenAPIV3.SchemaObject)
            );
          }
        }
      }

      // query parameters schemas
      const queryParameters = operation.parameters
        ?.map(p => p as OpenAPIV3.ParameterObject)
        .filter(p => p.in === 'query');
      if (queryParameters && queryParameters?.length > 0) {
        const name =
          capitalizeFirstLetter(operation.operationId!) + 'Parameters';
        const schema = {
          description: `Query parameters for operation ${operation.operationId}`,
          properties: Object.fromEntries(
            queryParameters.map(p => {
              let schemaObject = p as OpenAPIV3.SchemaObject;
              schemaObject = Object.assign(schemaObject, p.schema, {
                in: undefined,
                schema: undefined,
              });
              return [p.name, schemaObject];
            })
          ),
        };
        models.push(normalizeSchema(name, schema));
      }
    });
  });

  return models;
};

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

export const parse = (doc: OpenAPIV3.Document): ParseResult => {
  return {
    models: parseModels(doc),
    // models: [],
    paths: parsePaths(doc),
  };
};
