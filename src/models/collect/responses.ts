import type { OpenAPIV3 } from "openapi-types";

import type { NamedSchema } from "../../types.js";
import { capitalizeFirstLetter } from "../../utils.js";

export const collectResponses = (doc: OpenAPIV3.Document) => {
  const schemas: NamedSchema[] = [];
  Object.values(doc.paths).forEach((_pathContent) => {
    const pathContent = _pathContent as Record<string, any>;
    for (const method of ["get", "post", "put", "delete", "patch"]) {
      if (!(method in pathContent!)) {
        continue;
      }
      for (const response of Object.values(
        pathContent![method].responses,
      ) as OpenAPIV3.OperationObject[]) {
        if (!("content" in response)) {
          continue;
        }
        const responseContent = response.content as Record<string, any>;
        if (responseContent["application/json"]?.schema) {
          const schema = responseContent["application/json"].schema!;
          const multi = schema.allOf ?? schema.anyOf ?? schema.oneOf;
          if (multi) {
            const name = `${capitalizeFirstLetter(
              pathContent![method].operationId!,
            )}Response`;
            schema.$ref = `#/components/schemas/${name}`;
            schemas.push({ ...schema, name });
            delete schema.allOf;
            delete schema.anyOf;
            delete schema.oneOf;
          } else if (schema.type === "object") {
            // anonymous
            const name = `${capitalizeFirstLetter(
              pathContent![method].operationId!,
            )}Response`;
            schema.$ref = `#/components/schemas/${name}`;
            schemas.push({ ...schema, name });
            delete schema.type;
            delete schema.properties;
            delete schema.required;
          }
        }
      }
    }
  });
  return schemas;
};
