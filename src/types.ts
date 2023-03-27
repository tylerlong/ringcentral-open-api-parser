import { OpenAPIV3 } from 'openapi-types';

export type NamedSchema = OpenAPIV3.SchemaObject & { name: string };

export interface RawOperation {
  operationId?: string;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
}

export interface Model {
  name: string;
  description?: string;
  fields: Field[];
}

export interface Field {
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
}

export interface Path {
  paths: string[];
  parameter?: string;
  defaultParameter?: string;
  operations: Operation[];
}

export interface Operation {
  endpoint: string;
  method: string;
  tags?: string[];
  method2: string;
  description?: string;
  summary?: string;
  operationId: string;
  rateLimitGroup: string;
  appPermission: string;
  userPermission: string;
  withParameter: boolean;
  responseSchema?: ResponseSchema;
  queryParameters?: string;
  bodyParameters?: string;
  formUrlEncoded?: boolean;
  multipart?: boolean;
}

export interface ResponseSchema {
  $ref?: string;
  type?: string;
  format?: string;
}
