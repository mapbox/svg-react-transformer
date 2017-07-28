'use strict';

const cheerio = require('cheerio');
const reactifyAttribute = require('react-attr-converter');
const toInlineSvg = require('./to-inline-svg');
const reactifyStyle = require('./reactify-style');

const cheerioOptions = {
  xmlMode: true
};

// See docs in README.
//
// _skipOptimization is an internal option used to pass already-optimized
// SVGs into this.
function toJsx(svg, options) {
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
}

module.exports = toJsx;
