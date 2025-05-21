import { isEqual } from "lodash";

import type { Path } from "../types";

export const handleSpecialCases = (paths: Path[]) => {
  // body parameter is string[]
  const path = paths.find((p) =>
    isEqual(p.paths, ["restapi", "account", "extension", "message-store"])
  )!;
  const operation = path.operations.find(
    (o) =>
      o.method === "delete" &&
      o.endpoint ===
        "/restapi/{apiVersion}/account/{accountId}/extension/{extensionId}/message-store/{messageId}",
  )!;
  operation.bodyType = "string[]";

  // response type is []
  const path2 = paths.find((p) =>
    isEqual(p.paths, ["team-messaging", "v1", "files"])
  )!;
  const operation2 = path2.operations.find(
    (o) =>
      o.method === "post" &&
      o.endpoint === "/team-messaging/v1/files",
  )!;
  operation2.responseSchema!.$ref = "TMAddFile[]";

  return paths;
};
