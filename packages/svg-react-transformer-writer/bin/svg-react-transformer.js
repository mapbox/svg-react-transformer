#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

const path = require('path');
const meow = require('meow');
const chalk = require('chalk');
const writer = require('..');

const description = 'Convert SVGs to React components.';
const help = `
  ${chalk.bold.underline('Usage')}
    svg-to-react-template <files> [options]

    If files are wrapped in quotes, they will be interpreted by node-glob.
    Files without an .svg extension are automatically filtered out.

  ${chalk.bold.underline('Options')}
    -d, --out-dir   Required. Directory to write component modules to.
                    If the provided directory does not exist, it will be
                    created.
    -c, --config    Path to a configuration module.
                    The file should export an object that includes options
                    documented here: https://github.com/mapbox/svg-react-transformer-writer
    -V, --verbose   Log some additional information.

  ${chalk.bold.underline('Examples')}
    svg-to-react-template svg/* src/img/** --out-dir svg-components
    svg-to-react-template "src/**/*" "img/*" --out-dir ./some/place -c ./my-config.js
`;

const cli = meow(
  {
    description,
    help
  },
  {
    alias: {
      d: 'out-dir',
      c: 'config',
      V: 'verbose'
    }
  }
);

const files = cli.input;
if (files === undefined || files.length === 0) {
  cli.showHelp();
}

if (typeof cli.flags.outDir !== 'string') {
  console.log(`${chalk.red.bold('Error:')} -d, --out-dir is required`);
  process.exit(1);
}

let options = {};
if (cli.flags.config) {
  const configPath = path.isAbsolute(cli.flags.config)
    ? cli.flags.config
    : path.join(process.cwd(), cli.flags.config);
  options = require(configPath);
}

writer(files, cli.flags.outDir, options).then(info => {
  if (!cli.flags.verbose) return;

  info.forEach(item => {
    const source = path.relative(process.cwd(), item.source);
    const output = path.relative(process.cwd(), item.output);
    console.log(`${chalk.grey(source + ' ->')} ${output}`);
  });
  console.log(
    chalk.magenta(
      `Transformed ${info.length} files from SVGs to React component modules`
    )
  );
});
