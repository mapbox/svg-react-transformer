'use strict';

const _ = require('lodash');
const babel = require('babel-core');
const presetEnv = require('babel-preset-env');
const presetReact = require('babel-preset-react');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const toInlineSvg = require('./to-inline-svg');
const templates = require('./templates');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');

const babelOptions = { presets: [presetEnv, presetReact] };

// See docs in README.
function toComponentModule(svg, options) {
  options = Object.assign(
    {
      precompile: false
    },
    options
  );
  options.name =
    options.name !== undefined ? pascalCase(options.name) : 'SvgComponent';

  if (options.template === 'fancy') {
    options.svgoPlugins = applySvgoPluginDefaults(
      options.svgoPlugins,
      options.name,
      [
        { removeStyleElement: true },
        { removeTitle: true },
        {
          removeAttrs: {
            attrs: ['svg:(width|height)']
          }
        }
      ]
    );
  }

  const toInlineSvgOptions = {
    id: options.name,
    svgoPlugins: options.svgoPlugins
  };

  // Get the inline SVG outside of toJsx so we can pass it to the template.
  return toInlineSvg(svg, toInlineSvgOptions).then(inlineSvg => {
    return toJsx(inlineSvg, { _skipOptimization: true }).then(jsxSvg => {
      const templateData = Object.assign(
        _.omit(options, ['template', 'svgoPlugins']),
        {
          inlineSvg,
          jsxSvg,
          name: options.name
        }
      );

      let code;
      if (!options.template) {
        code = templates.default(templateData);
      } else if (typeof options.template === 'function') {
        code = options.template(templateData);
      } else if (templates[options.template]) {
        code = templates[options.template](templateData);
      } else {
        throw new Error(`Unrecognized template option "${options.template}"`);
      }

      if (!options.precompile) return code;
      return babel.transform(code, babelOptions).code;
    });
  });
}

module.exports = toComponentModule;
