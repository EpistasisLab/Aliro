/**
* example Jest test
*
* @see <https://facebook.github.io/jest/docs/en/getting-started.html>
*/
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});