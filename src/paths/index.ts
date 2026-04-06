import type { OpenAPIV3 } from "openapi-types";
import type { Model } from "../types.js";
import { getBridgePaths } from "./bridges.js";
import { getEndpointPaths } from "./endpoints.js";
import { handleSpecialCases } from "./special-cases.js";

export const preparePaths = (doc: OpenAPIV3.Document, models: Model[]) => {
  const endpointPaths = getEndpointPaths(doc, models);
  const bridgePaths = getBridgePaths(endpointPaths);
  let result = [...endpointPaths, ...bridgePaths].sort((path1, path2) =>
    path1.paths.join("/").length > path2.paths.join("/").length ? 1 : -1,
  );
  result = handleSpecialCases(result);
  return result;
};
