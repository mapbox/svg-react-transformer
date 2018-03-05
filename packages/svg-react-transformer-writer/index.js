'use strict';

const globby = require('globby');
const pify = require('pify');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const svgReactTransformer = require('@mapbox/svg-react-transformer');

const onlySvgGlob = '!**/!(*.svg)';

module.exports = (files, outDir, options) => {
  if (!files) throw new Error('You must specify input files');
  if (!outDir) throw new Error('You must specify an output directory');
  options = options || {};
  const filenameTemplate =
    options.filenameTemplate !== undefined ? options.filenameTemplate : x => x;

  const createComponentModule = svgFilename => {
    const componentName = path.basename(svgFilename, '.svg');
    const svgOptions = Object.assign({}, options, {
      name: componentName
    });
    return pify(fs.readFile)(svgFilename, 'utf8')
      .then(svg => {
        return svgReactTransformer.toComponentModule(svg, svgOptions);
      })
      .then(component => {
        const outFilename = filenameTemplate(componentName);
        const outFile = path.join(outDir, outFilename + '.js');
        return pify(fs.writeFile)(outFile, component).then(() => ({
          source: svgFilename,
          output: outFile
        }));
      });
  };

  const globs = typeof files === 'string' ? [files] : files;
  globs.push(onlySvgGlob);

  return globby(globs, { absolute: true }).then(svgFilenames => {
    return pify(mkdirp)(outDir).then(() =>
      Promise.all(svgFilenames.map(createComponentModule))
    );
  });
};
