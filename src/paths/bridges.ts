import { isEqual, last } from "lodash";

import type { Path } from "../types";

export const getBridgePaths = (result: Path[]): Path[] => {
  const bridgePaths: Path[] = [];
  for (const item of result) {
    for (let i = 1; i < item.paths.length; i++) {
      const subPaths = item.paths.slice(0, i);
      if (
        !bridgePaths.find((r) => isEqual(r.paths, subPaths)) &&
        !result.find((r) => isEqual(r.paths, subPaths))
      ) {
        const lastToken = last(subPaths);
        const endpoint = item.operations[0].endpoint;
        const match = endpoint.match(new RegExp(`/${lastToken}/\\{(.+?)\\}`));
        const match2 = endpoint.match(new RegExp(`/\\{(.+?)\\}/${lastToken}`));
        const noParentParameter = match2 === null;
        let parameter: string | undefined;
        let defaultParameter: string | undefined;
        if (match !== null) {
          parameter = match[1];
          switch (lastToken) {
            case "scim": {
              defaultParameter = "v2";
              break;
            }
            case "rcvideo": {
              defaultParameter = "v1";
              break;
            }
            case "team-messaging": {
              defaultParameter = "v1";
              break;
            }
            case "calls": {
              defaultParameter = "v1";
              break;
            }
          }
        }
        bridgePaths.push({
          paths: subPaths,
          operations: [],
          parameter,
          defaultParameter,
          noParentParameter,
        });
      }
    }
  }
  return bridgePaths;
};
