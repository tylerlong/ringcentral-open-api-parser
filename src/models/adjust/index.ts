import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema } from '../../types';
import { deRef } from './de-ref';
import { fixFax } from './fax';
import { fixGreeting } from './greeting';
import { mergeOf } from './merge-of';
import { fixMiscellaneous } from './miscellaneous';
import { ref } from './ref';

export const adjust = (_schemas: NamedSchema[], doc: OpenAPIV3.Document): NamedSchema[] => {
  let schemas = mergeOf(_schemas);
  schemas = deRef(schemas, doc);
  schemas = ref(schemas);
  schemas = fixFax(schemas);
  schemas = fixGreeting(schemas);
  schemas = fixMiscellaneous(schemas);
  return schemas;
};
