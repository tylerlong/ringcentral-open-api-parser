import {OpenAPIV3} from 'openapi-types';

export type ParseResult = {
  models: Model[];
  paths: Path[];
};

export type Model = {
  name: string;
  description?: string;
  fields: Field[];
};

export type Path = {
  paths: string[];
  parameter?: string;
  defaultParameter?: string;
  operations: Operation[];
};

export type ResponseSchema = {
  $ref?: string;
  type?: string;
  format?: string;
};

export type Operation = {
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
};

export type OneOf = { $ref: string };

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
  oneOf?: OneOf[];
};

export type SchemaDict = {
  [key: string]: OpenAPIV3.SchemaObject;
};
