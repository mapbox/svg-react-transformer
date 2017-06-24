'use strict';

const SVGO = require('svgo');
const cuid = require('cuid');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');

module.exports = (svg, options) => {
  options = options || {};
  if (!options.id) options.id = cuid();
  options.svgoPlugins = applySvgoPluginDefaults(
    options.svgoPlugins,
    options.id
  );

  const svgo = new SVGO({
    plugins: options.svgoPlugins
  });

  return new Promise((resolve, reject) => {
    svgo.optimize(svg, result => {
      if (result.error) return reject(result.error);
      resolve(result.data);
    });
  });
};
