import {OpenAPIV3} from 'openapi-types';
import {pascalCase} from 'change-case';

export type ParseResult = {
  models: Model[];
};

export type Model = {
  name: string;
  description?: string;
  fields: Field[];
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
  if (
    field.type === 'file' ||
    (field.type === 'string' && field.format === 'binary')
  ) {
    field.$ref = '#/components/schemas/Attachment';
    delete field.type;
    delete field.format;
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

export const parse = (doc: OpenAPIV3.Document): ParseResult => {
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

  // form-data schemas
  Object.keys(doc.paths).forEach(p => {
    const pathObject = doc.paths[p] as {
      [key: string]: OpenAPIV3.OperationObject;
    };
    Object.keys(pathObject).forEach(method => {
      const operation = pathObject[method];
      const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
      if (requestBody) {
        const mediaTypeObject =
          requestBody.content['application/x-www-form-urlencoded'] ||
          requestBody.content['multipart/form-data'];
        if (mediaTypeObject) {
          const schema = mediaTypeObject.schema!;
          if ('properties' in schema) {
            const name = pascalCase(operation.operationId!) + 'Request';
            models.push(
              normalizeSchema(name, schema as OpenAPIV3.SchemaObject)
            );
          }
        }
      }
    });
  });

  // query parameters schemas

  return {models};
};
