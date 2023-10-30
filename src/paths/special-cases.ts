import { isEqual } from 'lodash';

import type { Path } from '../types';

export const handleSpecialCases = (paths: Path[]) => {
  // body parameter is string[]
  const path = paths.find((p) => isEqual(p.paths, ['restapi', 'account', 'extension', 'message-store']))!;
  const operation = path.operations.find(
    (o) =>
      o.method === 'delete' &&
      o.endpoint === '/restapi/{apiVersion}/account/{accountId}/extension/{extensionId}/message-store/{messageId}',
  )!;
  operation.bodyType = 'string[]';
  return paths;
};
