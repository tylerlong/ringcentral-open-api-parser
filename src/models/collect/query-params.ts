import type { OpenAPIV3 } from "openapi-types";

import type { NamedSchema, RawOperation } from "../../types.js";
import { capitalizeFirstLetter } from "../../utils.js";

export const collectQueryParams = (
  doc: OpenAPIV3.Document,
  operations: RawOperation[],
) => {
  const schemas: NamedSchema[] = [];
  for (const operation of operations) {
    if (!operation.parameters) {
      continue;
    }
    let queryParameters = operation.parameters;
    for (const qp of queryParameters) {
      // inline parameters
      if ("$ref" in qp) {
        const name = (qp.$ref as string).split("/").pop()!;
        Object.assign(qp, doc.components?.parameters?.[name]);
        delete qp.$ref;
      }
    }
    // no path or header parameters
    queryParameters = operation.parameters.filter((p) => p.in === "query");
    if (queryParameters.length === 0) {
      continue;
    }

    // https://jira.ringcentral.com/browse/SDK-289
    for (const qp of queryParameters) {
      if (qp.name === "perPage") {
        const schema = qp.schema as OpenAPIV3.SchemaObject | undefined;
        if (!schema || !("oneOf" in schema) || !Array.isArray(schema.oneOf)) {
          continue;
        }
        schema.oneOf = schema.oneOf.filter((item: any) => {
          return item.type !== "string";
        });
      }
    }

    const name = capitalizeFirstLetter(operation.operationId!) + "Parameters";
    const schema = {
      name,
      description: `Query parameters for operation ${operation.operationId}`,
      properties: Object.fromEntries(
        queryParameters.map((p) => {
          const name = p.name;
          Object.assign(p, p.schema, {
            in: undefined,
            schema: undefined,
            name: undefined,
          });
          return [name, p];
        }),
      ),
    };
    schemas.push(schema as unknown as NamedSchema);
  }
  return schemas;
};
