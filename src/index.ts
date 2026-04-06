import { prepareModels } from "./models/index.js";
import { preparePaths } from "./paths/index.js";
import { getRawData } from "./raw-data.js";
export type * from "./types.js";

/**
 * Prepares the specification by extracting the necessary data from the OpenAPI document.
 *
 * @param filePath - The path to the OpenAPI document file.
 * @returns An object containing the prepared models and paths extracted from the OpenAPI document.
 */
export const prepareSpec = (filePath: string) => {
  const { doc, operations } = getRawData(filePath);
  const models = prepareModels(doc, operations);
  const paths = preparePaths(doc, models);
  return { models, paths };
};
