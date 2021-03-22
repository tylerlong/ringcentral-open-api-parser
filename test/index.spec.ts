import parse from '../src/index';

describe('index', () => {
  test('default', async () => {
    const parsed = parse();
    expect(parsed).toBe('Hello world');
  });
});
