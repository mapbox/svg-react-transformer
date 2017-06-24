'use strict';

const cheerio = require('cheerio');
const reactifyAttribute = require('react-attr-converter');
const toInlineSvg = require('./to-inline-svg');
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

// _skipOptimization is an internal option used to pass already-optimized
// SVGs into this.
module.exports = (svg, options) => {
  options = options || {};
  return Promise.resolve()
    .then(() => {
      if (options._skipOptimization) return svg;
      return toInlineSvg(svg, options);
    })
    .then(inlineSvg => {
      const $ = cheerio.load(inlineSvg, cheerioOptions);
      $('*').each((i, el) => {
        el.attribs = Object.keys(el.attribs).reduce((result, name) => {
          result[reactifyAttribute(name)] = el.attribs[name];
          return result;
        }, {});
      });
      const inlineSvgWithReactAttributes = $.xml();
      const jsx = inlineSvgWithReactAttributes
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/style="([\s\S]*?[^\\])"/, (match, p1) => {
          return `style={${reactifyStyle(p1)}}`;
        });
      return jsx;
    });
};
