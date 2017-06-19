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
  test('works on an airplane', () => {
    return svgToJsx(getFixture('airplane')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('works on an apple', () => {
    return svgToJsx(getFixture('apple')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('works on a big one', () => {
    return svgToJsx(getFixture('big')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('works on one with style attributes', () => {
    return svgToJsx(getFixture('style-attributes')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('passes SVGO plugins', () => {
    const options = {
      svgoPlugins: [{ removeDimensions: true }]
    };
    return svgToJsx(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('catches SVGO error', () => {
    return expect(svgToJsx('#<foo##p')).rejects.toMatch('Error in parsing SVG');
  });
});
