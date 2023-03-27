import { prepareModels } from './models';
import { preparePaths } from './paths';
import { getRawData } from './raw-data';

export const prepareSpec = (filePath: string) => {
  const { doc, operations } = getRawData(filePath);
  const models = prepareModels(doc, operations);
  const paths = preparePaths(doc);
  return { models, paths };
};
