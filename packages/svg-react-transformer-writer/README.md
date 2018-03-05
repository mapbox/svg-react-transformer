# @mapbox/svg-react-transformer-writer

Transform SVG files into React component module files.

Provides a Node API and a CLI.
Runs SVG files through [the `toComponentModule` function of svg-react-transformer](../svg-react-transformer/README.md#tocomponentmodule), then writes the React component modules to new files.

## Installation

```
npm install @mapbox/svg-react-transformer-writer
```

## Node API

### svgReactTransformerWriter

`svgReactTransformerWriter(files, outDir, [options])`

Returns a Promise that resolves when all output files have been written.

#### files

Type: `string | Array<string>`.
**Required**.

Globs that point to your SVG files.
Files without an `.svg` extension are automatically ignored.

#### outDir

Type: `string`.
**Required**.

Path to an output directory where React component module files will be written.

#### options

Type: `Object`.

**You can pass all of [the options from `toComponentModule`](../svg-react-transformer/README.md#tocomponentmodule)** (e.g. SVGO plugins, a component template).
**The `name` option is automatically provided**, derived from the basename of each input SVG file.

The following are additional options:

##### filenameTemplate

Type: `(svgBasename: string) => string`.
Default: `x => x`.

Determines the filenames of output React component modules.
Receives the input SVG file basename as an argument; should return the JS basename you want.
The default value is an identity function, so `foo-bar_baz.svg` becomes `foo-bar_baz.js`.

## CLI

The CLI allows you to do everything the Node API does by providing the option to load a configuration module that exports an `options` object.

Run `--help` for details.
