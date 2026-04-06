export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testTimeout: 8000,
  setupFiles: ["dotenv-override-true/config"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
