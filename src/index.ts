import {OpenAPIV3} from 'openapi-types';

import {ParseResult} from './types';
import {parseModels} from './models';
import {parsePaths} from './paths';

export const parse = (doc: OpenAPIV3.Document): ParseResult => {
  return {
    models: parseModels(doc),
    paths: parsePaths(doc),
  };
};
