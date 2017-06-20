'use strict';

const SVGO = require('svgo');
const cheerio = require('cheerio');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');
const reactifyAttribute = require('./reactify-attribute');

const cheerioOptions = {
  xmlMode: true
};

module.exports = (svg, options) => {
  options = options || {};
  options.svgoPlugins = applySvgoPluginDefaults(
    options.svgoPlugins,
    options.id
  );

  const svgo = new SVGO({
    plugins: options.svgoPlugins
  });

  return new Promise((resolve, reject) => {
    svgo.optimize(svg, svgoResult => {
      if (svgoResult.error) return reject(svgoResult.error);

      const $ = cheerio.load(svgoResult.data, cheerioOptions);

      $('*').each((i, el) => {
        el.attribs = Object.keys(el.attribs).reduce((result, name) => {
          result[reactifyAttribute(name)] = el.attribs[name];
          return result;
        }, {});
      });

      resolve($.xml());
    });
  });
};
