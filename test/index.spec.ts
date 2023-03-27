import { writeFileSync } from 'fs';

import { prepareSpec } from '../src';

describe('index', () => {
  test('default', async () => {
    const parsed = prepareSpec(process.env.SPEC_FILE_PATH!);
    writeFileSync('parsed.json', JSON.stringify(parsed, null, 2));
    expect(parsed.models).toBeDefined();
    expect(parsed.models.length).toBeGreaterThan(0);
    expect(parsed.paths).toBeDefined();
    expect(parsed.paths.length).toBeGreaterThan(0);

    const extensionPath = parsed.paths.find((path) => path.paths.join('-') === 'restapi-account-extension')!;
    expect(extensionPath.parameter).toBe('extensionId');

    const pagingOnlyGroupPath = parsed.paths.find(
      (path) => path.paths.join('-') === 'restapi-account-paging-only-groups',
    )!;
    expect(pagingOnlyGroupPath.parameter).toBe('pagingOnlyGroupId');

    const brandPath = parsed.paths.find((path) => path.paths.join('-') === 'restapi-dictionary-brand')!;
    expect(brandPath.parameter).toBe('brandId');

    const scimPath = parsed.paths.find((path) => path.paths.join('-') === 'scim')!;
    expect(scimPath.parameter).toBe('version');
    expect(scimPath.defaultParameter).toBe('v2');
  });

  test('form bodies', () => {
    const parsed = prepareSpec(process.env.SPEC_FILE_PATH!);
    const createIVRPromptRequest = parsed.models.find((m) => m.name === 'CreateIVRPromptRequest');
    expect(createIVRPromptRequest).toBeDefined();
    expect(createIVRPromptRequest!.fields.map((f) => f.name).join(',')).toBe('attachment,name');
  });

  test('query parameters', () => {
    const parsed = prepareSpec(process.env.SPEC_FILE_PATH!);
    const listUserTemplatesParameters = parsed.models.find((m) => m.name === 'ListUserTemplatesParameters');
    expect(listUserTemplatesParameters).toBeDefined();
    expect(listUserTemplatesParameters!.fields.map((f) => f.name).join(',')).toBe('type,page,perPage');
  });

  test('schemas', () => {
    const parsed = prepareSpec(process.env.SPEC_FILE_PATH!);
    const callsByDirectionBreakdown = parsed.models.find((m) => m.name === 'CallsByDirectionBreakdown');
    expect(callsByDirectionBreakdown).toBeDefined();
    expect(callsByDirectionBreakdown!.fields.map((f) => f.name).join(',')).toBe('inbound,outbound');
  });

  test('special cases', () => {
    const parsed = prepareSpec(process.env.SPEC_FILE_PATH!);
    const attachment = parsed.models.find((m) => m.name === 'Attachment');
    expect(attachment).toBeDefined();
    expect(attachment!.fields.map((f) => f.name).join(',')).toBe('filename,content,contentType');
  });
});
