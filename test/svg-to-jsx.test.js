'use strict';

const fs = require('fs');
const path = require('path');
const svgToJsx = require('../lib/svg-to-jsx');

const getFixture = name => {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', `${name}.svg`),
    'utf8'
  );
};

describe('svgToJsx', () => {
  test('works', () => {
    return svgToJsx(getFixture('airplane')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });
});
