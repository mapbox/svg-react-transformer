'use strict';

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const toJsx = require('../lib/to-jsx');

const getFixture = name => {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', `${name}.svg`),
    'utf8'
  );
};

describe('toJsx', () => {
  test('works on an airplane', () => {
    return toJsx(getFixture('airplane'), { id: 'airplane' }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works on an apple', () => {
    return toJsx(getFixture('apple'), { id: 'apple' }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works on a big one', () => {
    return toJsx(getFixture('big'), { id: 'big' }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works on a layered one, preserving order', () => {
    return toJsx(getFixture('layered'), { id: 'layered' }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works on one with style attributes', () => {
    return toJsx(getFixture('style-attributes'), {
      id: 'style-attributes'
    }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('passes SVGO plugins', () => {
    const options = {
      svgoPlugins: [{ removeDimensions: true }],
      id: 'apple'
    };
    return toJsx(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('catches SVGO error', () => {
    return expect(toJsx('#<foo##p', { id: 'error' })).rejects.toMatch(
      'Error in parsing SVG'
    );
  });
});

function format(js) {
  return prettier.format(js, { parser: 'babylon' });
}
