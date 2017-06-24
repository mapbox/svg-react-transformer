'use strict';

const _ = require('lodash');
const pascalCase = require('pascal-case');
const toJsx = require('./to-jsx');
const templates = require('./templates');

module.exports = (svg, options) => {
  options = options || {};

  const toJsxOptions = {
    svgoPlugins: options.svgoPlugins,
    id: options.name
  };
  return toJsx(svg, toJsxOptions).then(svgJsx => {
    const templateData = Object.assign(
      _.omit(options, ['template', 'svgoPlugins']),
      {
        svgJsx,
        name: options.name !== undefined
          ? pascalCase(options.name)
          : 'SvgComponent'
      }
    );

    if (options.template) return options.template(templateData);
    return templates.default(templateData);
  });
};
