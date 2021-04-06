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
  endpoint: string;
  paths: string[];
  parameter?: string;
  operations: Operation[];
};

export type Operation = {
  method: string;
  description?: string;
  summary?: string;
  operationId: string;
  rateLimitGroup: string;
  appPermission: string;
  userPermission: string;
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
