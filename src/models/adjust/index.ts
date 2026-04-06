import type { OpenAPIV3 } from "openapi-types";

import type { NamedSchema } from "../../types.js";
import { deRef } from "./de-ref.js";
import { fixFax } from "./fax.js";
import { fixGreeting } from "./greeting.js";
import { implicitArray } from "./implicit-array.js";
import { mergeOf } from "./merge-of.js";
import { fixMiscellaneous } from "./miscellaneous.js";
import { ref } from "./ref.js";

export const adjust = (
  _schemas: NamedSchema[],
  doc: OpenAPIV3.Document,
): NamedSchema[] => {
  let schemas = mergeOf(_schemas);
  schemas = ref(schemas);
  schemas = deRef(schemas, doc);
  schemas = fixFax(schemas);
  schemas = fixGreeting(schemas);
  schemas = fixMiscellaneous(schemas);
  schemas = implicitArray(schemas);
  return schemas;
};
