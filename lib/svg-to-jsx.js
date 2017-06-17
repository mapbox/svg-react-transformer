'use strict';

const React = require('react');
const HtmlToReact = require('html-to-react').Parser;
const SVGO = require('svgo');
const prettyFormat = require('pretty-format');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');

const htmlToReactParser = new HtmlToReact(React);

module.exports = (svg, options) => {
  options = options || {};
  options.svgoPlugins = applySvgoPluginDefaults(options.svgoPlugins);

  const svgo = new SVGO({
    plugins: options.svgoPlugins
  });

  return new Promise((resolve, reject) => {
    svgo.optimize(svg, svgoResult => {
      if (svgoResult.error) {
        return reject(svgoResult.error);
      }
      const reactSvg = htmlToReactParser.parse(svgoResult.data);
      const jsxSvg = prettyFormat(reactSvg, {
        plugins: [prettyFormat.plugins.ReactElement]
      });
      resolve(jsxSvg);
    });
  });
};
