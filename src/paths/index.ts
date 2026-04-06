import type { OpenAPIV3 } from "openapi-types";

import { getEndpointPaths } from "./endpoints.js";
import { getBridgePaths } from "./bridges.js";
import { handleSpecialCases } from "./special-cases.js";
import type { Model } from "../types.js";

export const preparePaths = (doc: OpenAPIV3.Document, models: Model[]) => {
  const endpointPaths = getEndpointPaths(doc, models);
  const bridgePaths = getBridgePaths(endpointPaths);
  let result = [...endpointPaths, ...bridgePaths].sort((path1, path2) =>
    path1.paths.join("/").length > path2.paths.join("/").length ? 1 : -1
  );
  result = handleSpecialCases(result);
  return result;
};
