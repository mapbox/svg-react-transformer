'use strict';

const SVGO = require('svgo');
const xml2js = require('xml2js');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');
const reactifyAttribute = require('./reactify-attribute');

const xmlParser = new xml2js.Parser({
  attrNameProcessors: [reactifyAttribute]
});
const xmlBuilder = new xml2js.Builder({
  pretty: true,
  headless: true
});

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
      xmlParser.parseString(svgoResult.data, (parseError, data) => {
        if (parseError) return reject(parseError);
        const reactifiedSvg = xmlBuilder.buildObject(data);
        resolve(reactifiedSvg);
      });
    });
  });
};
