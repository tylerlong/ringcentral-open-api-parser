import type { OpenAPIV3 } from "openapi-types";

import { collect } from "./collect/index.js";
import { adjust } from "./adjust/index.js";
import { normalize } from "./normalize.js";
import type { RawOperation } from "../types.js";

export const prepareModels = (
  doc: OpenAPIV3.Document,
  operations: RawOperation[],
) => {
  const r = collect(doc, operations);
  const r2 = adjust(r, doc);
  return normalize(r2);
};
