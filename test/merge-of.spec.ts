import { mergeOf } from "../src/models/adjust/merge-of.js";
import type { NamedSchema } from "../src/types.js";

describe("mergeOf", () => {
  test("removes deprecated composed properties before merging", () => {
    const schemas: NamedSchema[] = [
      {
        name: "UBrandInfo",
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      {
        name: "ProfileInfo",
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      {
        name: "ServiceInfo",
        type: "object",
        properties: {
          uBrand: { $ref: "#/components/schemas/UBrandInfo" },
          ubrand: {
            allOf: [
              { $ref: "#/components/schemas/UBrandInfo" },
              { deprecated: true },
            ],
            description: "Deprecated: use uBrand instead.",
          },
          profile: {
            allOf: [
              { $ref: "#/components/schemas/ProfileInfo" },
              {
                type: "object",
                properties: {
                  nickname: { type: "string" },
                },
              },
            ],
          },
        },
      },
    ];

    const serviceInfo = mergeOf(schemas).find((s) => s.name === "ServiceInfo");

    expect(serviceInfo?.properties?.uBrand).toEqual({
      $ref: "#/components/schemas/UBrandInfo",
    });
    expect(serviceInfo?.properties?.ubrand).toBeUndefined();
    expect(serviceInfo?.properties?.profile).toMatchObject({
      properties: {
        id: { type: "string" },
        nickname: { type: "string" },
      },
    });
  });
});
