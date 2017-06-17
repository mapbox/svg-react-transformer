#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const globby = require('globby');
const meow = require('meow');
const chalk = require('chalk');
const pify = require('pify');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const svgToComponentModule = require('../lib/svg-to-component-module');

const description = 'Convert SVGs to React components.';
const help = `
  ${chalk.bold.underline('Usage')}
    svg-to-react-template <files> [options]

    If files are wrapped in quotes, they will be interpreted by node-glob.
    Files without an .svg extension are automatically filtered out.

  ${chalk.bold.underline('Options')}
    -c, --config    Path to a configuration module. To learn about
                    configuration, read the project's README.
    -d, --out-dir   Directory to write component modules to. If no out-dir
                    is provided, components are console logged. If the
                    provided directory does not exist, it will be created.
                    Each component module name will be a kebab-case version
                    of the SVG source file's basename.
    -V, --verbse    Log some additional information.

  ${chalk.bold.underline('Examples')}
    svg-to-react-template svg/* src/img/* --out-dir svg-components
    svg-to-react-template 'src/**/*, 'img/*' --out-dir some/special/place -c svg-react-config.js
`;

const cli = meow(
  {
    description,
    help
  },
  {
    alias: {
      c: 'config',
      d: 'out-dir',
      V: 'verbose'
    }
  }
);

const svgFileGlobs = cli.input;
if (svgFileGlobs === undefined || svgFileGlobs.length === 0) {
  cli.showHelp();
}
svgFileGlobs.push('!**/!(*.svg)');

let options = {};
if (cli.flags.config) {
  options = require(cli.flags.config);
}

const createComponentModule = svgFilename => {
  const componentName = path.basename(svgFilename, '.svg');
  const svgOptions = Object.assign({}, options, {
    name: componentName
  });
  return pify(fs.readFile)(svgFilename, 'utf8')
    .then(svg => {
      return svgToComponentModule(svg, svgOptions);
    })
    .then(component => {
      if (!cli.flags.outDir) {
        console.log(component);
        return;
      }

      const outFile = path.join(
        cli.flags.outDir,
        _.kebabCase(componentName) + '.js'
      );

      if (cli.flags.verbose) {
        console.log(
          `${chalk.grey(
            path.relative(process.cwd(), svgFilename) + ' ->'
          )} ${outFile}`
        );
      }

      return pify(fs.writeFile)(outFile, component);
    });
};

globby(svgFileGlobs, { absolute: true }).then(svgFilenames => {
  if (cli.flags.verbose) {
    console.log(chalk.magenta('\nInput globs:'));
    console.log(svgFileGlobs.map(g => `  ${g}`).join('\n'));
    console.log(chalk.magenta('\nSVG files to process:'));
    console.log(svgFilenames.map(g => `  ${g}`).join('\n'));
    console.log('');
  }

  const makeOutDir = cli.flags.outDir
    ? pify(mkdirp)(cli.flags.outDir)
    : Promise.resolve();
  return makeOutDir.then(() =>
    Promise.all(svgFilenames.map(createComponentModule))
  );
});
