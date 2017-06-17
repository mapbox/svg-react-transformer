'use strict';

const fs = require('fs');
const path = require('path');
const svgToComponentModule = require('../lib/svg-to-component-module');

const getFixture = name => {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', `${name}.svg`),
    'utf8'
  );
};

describe('svgToComponentModule', () => {
  test('works', () => {
    return svgToComponentModule(getFixture('airplane'), {
      name: 'airplane'
    }).then(result => {
      expect(result).toMatchSnapshot();
    });
  });
});
