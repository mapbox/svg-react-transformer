'use strict';

const exec = require('child_process').exec;
const del = require('del');
const path = require('path');

const outputDir = path.join(__dirname, '../../../tmp/');
const runWriter = (args, callback) => {
  exec(
    `bin/svg-react-transformer.js ${args.join(' ')}`,
    { cwd: path.join(__dirname, '..') },
    callback
  );
};

describe('bin', () => {
  afterEach(() => {
    return del(outputDir, { force: true });
  });

  test('logs verbose output', done => {
    runWriter(
      ['test/fixtures/*.svg', '--out-dir', outputDir, '--verbose'],
      (error, stdout) => {
        expect(error).toBeFalsy();
        expect(stdout).toMatchSnapshot();
        done();
      }
    );
  });
});
