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
  test('works with an airplane', () => {
    return svgToComponentModule(getFixture('airplane')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('works with an apple', () => {
    return svgToComponentModule(getFixture('apple')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('passes SVGO plugins', () => {
    const options = {
      svgoPlugins: [{ removeDoctype: true }, { removeDimensions: true }]
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.name', () => {
    const options = {
      name: 'apple'
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.propTypes', () => {
    const options = {
      propTypes: {
        width: 'PropTypes.number.isRequired',
        height: 'PropTypes.number.isRequired'
      }
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.template', () => {
    const options = {
      name: 'Fakery',
      propTypes: { width: 'PropTypes.number' },
      template: data => {
        return JSON.stringify(data, null, 2);
      }
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });
});
