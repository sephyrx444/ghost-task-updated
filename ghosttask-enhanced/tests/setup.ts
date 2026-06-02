import { beforeAll, afterAll } from 'vitest';

// Pre-define required environment variables for test execution isolation
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ghosttask_test';

beforeAll(() => {
  // Silence logs during testing to keep stdout clean
  // console.log = () => {};
  // console.warn = () => {};
  // console.error = () => {};
});

afterAll(() => {
  // Teardown steps if any
});
