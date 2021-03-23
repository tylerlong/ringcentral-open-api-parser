import {parse} from '../src/index';
import fs from 'fs';
import yaml from 'js-yaml';
import {OpenAPIV3} from 'openapi-types';

const doc = yaml.load(
  fs.readFileSync(process.env.SPEC_FILE_PATH!, 'utf8')
) as OpenAPIV3.Document;

describe('index', () => {
  test('default', async () => {
    const parsed = parse(doc);
    console.log(JSON.stringify(parsed, null, 2));
    expect(parsed.models).toBeDefined();
  });
});
