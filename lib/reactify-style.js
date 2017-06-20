'use strict';

const postcss = require('postcss');
const postcssJs = require('postcss-js');
const stringifyObject = require('stringify-object');

module.exports = css => {
  const root = postcss.parse(css);
  const obj = postcssJs.objectify(root);
  return stringifyObject(obj);
};
