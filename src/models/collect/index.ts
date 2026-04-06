import type { OpenAPIV3 } from "openapi-types";

import type { NamedSchema, RawOperation } from "../../types.js";
import { collectRequestBodies } from "./request-bodies.js";
import { collectQueryParams } from "./query-params.js";
import { collectSchemas } from "./schemas.js";
import { handleSpecialCases } from "./special-cases.js";
import { collectResponses } from "./responses.js";

export const collect = (
  doc: OpenAPIV3.Document,
  operations: RawOperation[],
) => {
  const schemas: NamedSchema[] = [];
  schemas.push(...handleSpecialCases());
  schemas.push(...collectQueryParams(doc, operations));
  schemas.push(...collectRequestBodies(operations));
  schemas.push(...collectSchemas(doc));
  schemas.push(...collectResponses(doc));
  return schemas;
};
