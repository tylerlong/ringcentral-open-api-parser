import type { OpenAPIV3 } from "openapi-types";

import type { NamedSchema } from "../../types";

const shouldBeInline = (schema: NamedSchema): boolean => {
  if (
    schema.type === "boolean" ||
    schema.type === "number" ||
    schema.type === "integer" ||
    schema.type === "string" ||
    schema.type === "array"
  ) {
    return true;
  }
  // array
  if ("items" in schema) {
    return shouldBeInline(schema.items as NamedSchema);
  }
  return false;
};

/**
 * The ideas is to replace all `string` and `string[]` `$ref` with the actual schema.
 * Because in some programming languages, they are considered primitive types.
 * @param schemas schemas to be processced
 * @returns processed schemas
 */
export const deRef = (
  schemas: NamedSchema[],
  doc: OpenAPIV3.Document,
): NamedSchema[] => {
  for (const schema of schemas) {
    // replace pure $ref with the actual schema
    if ("$ref" in schema) {
      const target = doc.components!
        .schemas![(schema.$ref as string).split("/").pop()!] as NamedSchema;
      if (target) {
        const temp = { ...target };
        delete temp.name;
        Object.assign(schema, temp);
      }
      delete schema.$ref;
    }
  }
  const inlineSchemas = schemas.filter((schema) => shouldBeInline(schema));
  const objectSchemas = schemas.filter((schema) => !shouldBeInline(schema));
  for (const os of objectSchemas) {
    if (!("properties" in os)) {
      continue;
    }
    for (const val of Object.values(os.properties!)) {
      if ("$ref" in val) {
        const name = (val.$ref as string).split("/").pop()!;
        const found = inlineSchemas.find((is) => is.name === name);
        if (found) {
          Object.assign(val, found, { name: undefined });
          delete (val as any).$ref;
        }
      }
      if ("items" in val && "$ref" in val.items) {
        const name = (val.items.$ref as string).split("/").pop()!;
        const found = inlineSchemas.find((is) => is.name === name);
        if (found) {
          Object.assign(val.items, found, { name: undefined });
          delete (val.items as any).$ref;
        }
      }
    }
  }
  return objectSchemas;
};
