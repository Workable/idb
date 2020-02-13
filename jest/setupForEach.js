import { clear as clearCache } from "../src";

afterEach(() => jest.restoreAllMocks());
afterEach(() => jest.clearAllMocks());
afterEach(() => jest.clearAllTimers());
afterEach(() => clearCache());
