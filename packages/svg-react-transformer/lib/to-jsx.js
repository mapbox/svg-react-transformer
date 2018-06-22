'use strict';

const cheerio = require('cheerio');
const reactifyAttribute = require('react-attr-converter');
const postcss = require('postcss');
const postcssJs = require('postcss-js');
const stringifyObject = require('stringify-object');
const toInlineSvg = require('./to-inline-svg');

function cssToStyleObjectString(css) {
  const root = postcss.parse(css);
  const obj = postcssJs.objectify(root);
  return stringifyObject(obj);
}

const cheerioOptions = {
  xmlMode: true
};

// See docs in README.
//
// _skipOptimization is an internal option used to pass
// already-inlined-and-optimized SVGs into this.
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
        // Handle some unwanted conversion to HTML character entities.
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        // Replace style attribute values with stringified style objects.
        .replace(/style="([\s\S]*?[^\\])"/g, (match, p1) => {
          return `style={${cssToStyleObjectString(p1)}}`;
        });
      return jsx;
    });
}

module.exports = toJsx;
