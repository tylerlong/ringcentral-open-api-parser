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
    console.log(jsonStr);
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'parsed.json'), jsonStr);
    expect(parsed.models).toBeDefined();
  });
});
