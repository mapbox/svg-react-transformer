'use strict';

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const svgToJsx = require('../lib/svg-to-jsx');

const getFixture = name => {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', `${name}.svg`),
    'utf8'
  );
};

describe('svgToJsx', () => {
  test('works on an airplane', () => {
    return svgToJsx(getFixture('airplane'), { id: 'airplane' }).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('works on an apple', () => {
    return svgToJsx(getFixture('apple'), { id: 'apple' }).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('works on a big one', () => {
    return svgToJsx(getFixture('big'), { id: 'big' }).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('works on a layered one, preserving order', () => {
    return svgToJsx(getFixture('layered'), { id: 'layered' }).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('works on one with style attributes', () => {
    return svgToJsx(getFixture('style-attributes'), {
      id: 'style-attributes'
    }).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('passes SVGO plugins', () => {
    const options = {
      svgoPlugins: [{ removeDimensions: true }],
      id: 'apple'
    };
    return svgToJsx(getFixture('apple'), options).then(result => {
      expect(prettier.format(result)).toMatchSnapshot();
    });
  });

  test('catches SVGO error', () => {
    return expect(svgToJsx('#<foo##p', { id: 'error' })).rejects.toMatch(
      'Error in parsing SVG'
    );
  });
});
