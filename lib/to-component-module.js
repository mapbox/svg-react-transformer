'use strict';

const _ = require('lodash');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const toInlineSvg = require('./to-inline-svg');
const templates = require('./templates');

module.exports = (svg, options) => {
  options = options || {};

  const name = options.name !== undefined
    ? pascalCase(options.name)
    : 'SvgComponent';

  const toInlineSvgOptions = {
    svgoPlugins: options.svgoPlugins,
    id: options.name
  };

  return toInlineSvg(svg, toInlineSvgOptions).then(inlineSvg => {
    return toJsx(inlineSvg, { _skipOptimization: true }).then(jsxSvg => {
      const templateData = Object.assign(
        _.omit(options, ['template', 'svgoPlugins']),
        {
          inlineSvg,
          jsxSvg,
          name
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
};
