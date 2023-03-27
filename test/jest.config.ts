export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 8000,
  setupFiles: ['dotenv-override-true/config'],
};
