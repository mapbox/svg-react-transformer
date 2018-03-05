'use strict';

const tempy = require('tempy');
const fs = require('fs');
const pify = require('pify');
const path = require('path');
const del = require('del');
const svgReactTransformer = require('@mapbox/svg-react-transformer');
const writer = require('..');

describe('svgReactTransformerWriter', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = tempy.directory();
  });
  afterEach(() => {
    return del(tmpDir, { force: true });
  });

  test('outputs one component file per SVG source file', () => {
    return writer(path.join(__dirname, './fixtures/**'), tmpDir)
      .then(() => pify(fs.readdir)(tmpDir))
      .then(outputFiles => {
        expect(outputFiles).toEqual(['airplane.js', 'apple.js', 'big.js']);
      });
  });

  test('file content matches svgReactTransformer.toComponentModule, with name provided', () => {
    const fixtureContent = fs.readFileSync(
      path.join(__dirname, 'fixtures/apple.svg'),
      'utf8'
    );
    return writer([path.join(__dirname, 'fixtures/apple.svg')], tmpDir)
      .then(() => {
        return Promise.all([
          pify(fs.readFile)(path.join(tmpDir, 'apple.js'), 'utf8'),
          svgReactTransformer.toComponentModule(fixtureContent, {
            name: 'apple'
          })
        ]);
      })
      .then(data => {
        expect(data[0]).toBe(data[1]);
      });
  });

  test('options.filenameTemplate', () => {
    const options = {
      filenameTemplate: name => `svg-cmp-${name}`
    };
    return writer(path.join(__dirname, './fixtures/**'), tmpDir, options)
      .then(() => pify(fs.readdir)(tmpDir))
      .then(outputFiles => {
        expect(outputFiles).toEqual([
          'svg-cmp-airplane.js',
          'svg-cmp-apple.js',
          'svg-cmp-big.js'
        ]);
      });
  });

  test('options passed to toComponentModule', () => {
    const options = {
      filenameTemplate: name => `svg-cmp-${name}`,
      svgoPlugins: [{ removeDimensions: true }],
      propTypes: `{ name: 'PropTypes.string.isRequired' }`,
      defaultProps: `{ name: 'foo' }`
    };

    return writer(path.join(__dirname, './fixtures/apple.svg'), tmpDir, options)
      .then(() =>
        pify(fs.readFile)(path.join(tmpDir, 'svg-cmp-apple.js'), 'utf8')
      )
      .then(result => {
        expect(result).toMatchSnapshot();
      });
  });
});
