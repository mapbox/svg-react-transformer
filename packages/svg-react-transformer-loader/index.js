'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');
const pascalCase = require('pascal-case');
const svgReactTransformer = require('@mapbox/svg-react-transformer');

const defaultOptions = {
  precompile: true
};

module.exports = function(source) {
  let options = loaderUtils.getOptions(this);
  options = Object.assign(defaultOptions, options);
  const relativeResourcePath = path.relative(this.context, this.resourcePath);
  options.name = pascalCase(relativeResourcePath.replace(/\.svg$/, ''));
  const callback = this.async();
  return svgReactTransformer.toComponentModule(source, options).then(result => {
    callback(null, result);
  }, callback);
};
