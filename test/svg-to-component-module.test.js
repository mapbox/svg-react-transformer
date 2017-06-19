'use strict';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const babel = require('babel-core');
const babelPresetEs2015 = require('babel-preset-es2015');
const babelPresetReact = require('babel-preset-react');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const pify = require('pify');
const del = require('del');
const svgToComponentModule = require('../lib/svg-to-component-module');

const tmpDir = path.join(__dirname, './tmp');

const getFixture = name => {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', `${name}.svg`),
    'utf8'
  );
};

const loadOutputModule = content => {
  const compiledContent = babel.transform(content, {
    presets: [babelPresetEs2015, babelPresetReact]
  }).code;
  const filename = path.join(tmpDir, crypto.randomBytes(16).toString('hex'));
  return pify(fs.writeFile)(filename, compiledContent).then(() => {
    const module = require(filename);
    return module;
  });
};

const renderComponent = (Component, props) => {
  return ReactDOMServer.renderToString(
    React.createElement(Component, null, props)
  );
};

describe('svgToComponentModule', () => {
  beforeAll(() => {
    return pify(fs.mkdir)(tmpDir);
  });

  afterAll(() => {
    return del(tmpDir);
  });

  afterEach(() => {
    return del(path.join(tmpDir, '*.*'));
  });

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

  test('works with a big one', () => {
    return svgToComponentModule(getFixture('big')).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('works with one with style attributes', () => {
    return svgToComponentModule(getFixture('style-attributes'), {
      name: 'style-attributes'
    }).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('creates valid React components from an airplane', () => {
    return svgToComponentModule(getFixture('airplane'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const rendered = renderComponent(Output);
        expect(rendered).toMatchSnapshot();
      });
  });

  test('creates valid React components from a big messy SVG', () => {
    return svgToComponentModule(getFixture('big'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const rendered = renderComponent(Output);
        expect(rendered).toMatchSnapshot();
      });
  });

  test('Component puts props on <svg> element', () => {
    return svgToComponentModule(getFixture('apple'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const renderedWithProps = renderComponent(Output, {
          width: 30,
          height: 40
        });
        expect(renderedWithProps).toMatchSnapshot();
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
      propTypes: `{
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      }`
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.defaultProps', () => {
    const options = {
      defaultProps: `{
        role: 'img',
        focusable: 'false'
      }`
    };
    return svgToComponentModule(
      getFixture('airplane'),
      options
    ).then(result => {
      expect(result).toMatchSnapshot();
    });
  });

  test('options.template', () => {
    const options = {
      name: 'Fakery',
      propTypes: `{ width: PropTypes.number }`,
      template: data => {
        return `${data.name}\n${data.propTypes}\n${data.svgJsx}`;
      }
    };
    return svgToComponentModule(getFixture('apple'), options).then(result => {
      expect(result).toMatchSnapshot();
    });
  });
});
