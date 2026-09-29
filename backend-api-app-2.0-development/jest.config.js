/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/build'],
  setupFilesAfterEnv: ['<rootDir>/src/utils/prisma/prisma.mock.ts'],
};
