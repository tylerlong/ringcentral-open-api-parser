/* eslint-disable node/no-unpublished-import */
import {parse} from '../src/index';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {OpenAPIV3} from 'openapi-types';

const doc = yaml.load(
  fs.readFileSync(process.env.SPEC_FILE_PATH!, 'utf8')
) as OpenAPIV3.Document;

describe('index', () => {
  test('default', async () => {
    const parsed = parse(doc);
    const jsonStr = JSON.stringify(parsed, null, 2);
    fs.writeFileSync(path.join(__dirname, 'parsed.json'), jsonStr);
    expect(parsed.models).toBeDefined();
    expect(parsed.models.length).toBeGreaterThan(0);
    expect(parsed.paths).toBeDefined();
    expect(parsed.paths.length).toBeGreaterThan(0);
    const groupPath = parsed.paths.find(
      path => path.paths.join('-') === 'restapi-glip-groups'
    )!;
    expect(groupPath.parameter).toBe('groupId');
  });
});
