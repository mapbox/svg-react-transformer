'use strict';

const SVGO = require('svgo');
const cheerio = require('cheerio');
const applySvgoPluginDefaults = require('./apply-svgo-plugin-defaults');
const reactifyAttribute = require('react-attr-converter');
const reactifyStyle = require('./reactify-style');

const transformAstAttrs = node => {
  if (node.attrs) {
    node.attrs = node.attrs.map(attr => {
      return Object.assign({}, attr, { name: reactifyAttribute(attr.name) });
    });
  }
  if (node.childNodes) {
    node.childNodes.forEach(transformAstAttrs);
  }
};

const cheerioOptions = {
  xmlMode: true
};

module.exports = (svg, options) => {
  options = Object.assign(
    {
      optimize: true
    },
    options
  );

  options.svgoPlugins = applySvgoPluginDefaults(
    options.svgoPlugins,
    options.id
  );

  const optimize = () => {
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

  return Promise.resolve()
    .then(() => {
      if (options.optimize) return optimize();
      return svg;
    })
    .then(svg2 => {
      const $ = cheerio.load(svg2, cheerioOptions);
      $('*').each((i, el) => {
        el.attribs = Object.keys(el.attribs).reduce((result, name) => {
          result[reactifyAttribute(name)] = el.attribs[name];
          return result;
        }, {});
      });
      const svg3 = $.xml();
      const svg4 = svg3
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/style="([\s\S]*?[^\\])"/, (match, p1) => {
          return `style={${reactifyStyle(p1)}}`;
        });
      return svg4;
    });
};
