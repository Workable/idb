export default (now = 1000) => {
  global.Date = jest.fn();
  global.Date.now = jest.fn().mockImplementation(() => now);
  return current => (now = current * 1000);
};
