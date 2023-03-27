import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema } from '../../types';

export const fixMiscellaneous = (schemas: NamedSchema[]): NamedSchema[] => {
  for (const name of ['AdaptiveCardRequest', 'AdaptiveCardInfo']) {
    const bgImage = schemas.find((s) => s.name === name)!.properties!.backgroundImage as OpenAPIV3.ReferenceObject;
    bgImage.$ref = '#/components/schemas/BackgroundImage';
    delete (bgImage as unknown as NamedSchema).oneOf;
  }
  return schemas;
};
