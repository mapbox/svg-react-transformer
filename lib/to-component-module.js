'use strict';

const _ = require('lodash');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const toInlineSvg = require('./to-inline-svg');
const templates = require('./templates');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');

// See docs in README.
function toComponentModule(svg, options) {
  options = options || {};
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

      if (!options.template) {
        return templates.default(templateData);
      } else if (typeof options.template === 'function') {
        return options.template(templateData);
      } else if (templates[options.template]) {
        return templates[options.template](templateData);
      } else {
        throw new Error(`Unrecognized template option "${options.template}"`);
      }
    });
  });
}

module.exports = toComponentModule;
