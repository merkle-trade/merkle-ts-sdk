/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist/*", "examples/*"],
  collectCoverage: true,
  maxWorkers: 4,
};
