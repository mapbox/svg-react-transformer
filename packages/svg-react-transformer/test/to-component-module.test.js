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
const prettier = require('prettier');
const toComponentModule = require('../lib/to-component-module');

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
  return ReactDOMServer.renderToString(React.createElement(Component, props));
};

describe('toComponentModule', () => {
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
    return toComponentModule(getFixture('airplane')).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works with an apple', () => {
    return toComponentModule(getFixture('apple')).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works with a big one', () => {
    return toComponentModule(getFixture('big')).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('works with a template with style attributes', () => {
    return toComponentModule(getFixture('style-attributes'), {
      name: 'style-attributes'
    }).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('creates valid React components from an airplane', () => {
    return toComponentModule(getFixture('airplane'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const rendered = renderComponent(Output);
        expect(rendered).toMatchSnapshot();
      });
  });

  test('creates valid React components from a big messy SVG', () => {
    return toComponentModule(getFixture('big'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const rendered = renderComponent(Output);
        expect(rendered).toMatchSnapshot();
      });
  });

  test('Component puts props on <svg> element', () => {
    return toComponentModule(getFixture('apple'))
      .then(result => {
        return loadOutputModule(result);
      })
      .then(Output => {
        const renderedWithProps = renderComponent(Output, {
          width: 40,
          height: 40
        });
        expect(renderedWithProps).toMatchSnapshot();
      });
  });

  test('passes SVGO plugins', () => {
    const options = {
      svgoPlugins: [{ removeDoctype: true }, { removeDimensions: true }]
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.name', () => {
    const options = {
      name: 'apple'
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.propTypes', () => {
    const options = {
      propTypes: `{
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
      }`
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.defaultProps', () => {
    const options = {
      defaultProps: `{
        role: 'img',
        focusable: 'false'
      }`
    };
    return toComponentModule(getFixture('airplane'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.template function', () => {
    const options = {
      name: 'Fakery',
      propTypes: `{ width: PropTypes.number }`,
      template: data => {
        return `${data.name}\n${data.propTypes}\n${data.jsxSvg}`;
      }
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.template "fancy"', () => {
    const options = {
      name: 'Fakery',
      template: 'fancy'
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.template "fancy" with svg that could trigger removeViewBox', () => {
    const options = {
      name: 'Fakery',
      template: 'fancy'
    };
    // svgo removeViewBox plugin will, by default since v1.0.0,
    // remove `viewBox` attr which coincides with a width / height box
    return toComponentModule(getFixture('big'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('options.template "fancy" with user-defined removeAttrs plugin', () => {
    const options = {
      name: 'Fakery',
      template: 'fancy',
      svgoPlugins: [{ removeAttrs: { attrs: ['style'] } }]
    };
    return toComponentModule(getFixture('apple'), options).then(result => {
      expect(format(result)).toMatchSnapshot();
    });
  });

  test('invalid options.template', () => {
    const options = {
      name: 'Fakery',
      propTypes: `{ width: PropTypes.number }`,
      template: 'usssseSymbol'
    };
    return toComponentModule(getFixture('apple'), options).then(
      () => {
        throw new Error('Should have errored');
      },
      error => {
        expect(error.message).toContain('usssseSymbol');
      }
    );
  });

  test('options.precompile', () => {
    return toComponentModule(getFixture('airplane'), { precompile: true })
      .then(result => {
        expect(format(result)).toMatchSnapshot();
        return loadOutputModule(result);
      })
      .then(Output => {
        const rendered = renderComponent(Output);
        expect(rendered).toMatchSnapshot();
      });
  });
});

function format(js) {
  return prettier.format(js, { parser: 'babylon' });
}
