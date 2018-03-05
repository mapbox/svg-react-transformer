# @mapbox/svg-react-transformer-loader

A Webpack loader to transform SVG files into React component modules.

Runs SVG files through the [`toComponentModule`] function of [svg-react-transformer].
Please read the [svg-react-transformer] documentation for more details and code examples.

## Installation

```
npm install @mapbox/svg-react-transformer-loader
```

## Usage

Follow the instructions for using [Webpack loaders](https://webpack.js.org/concepts/loaders/).

**You can pass all of the options from svg-react-transformer's [`toComponentModule`] function** (e.g. SVGO plugins, a component template).

By default, the output of this loader is precompiled with Babel.
You can bypass this step (and use your own compilation) by passing the additional option `precompile: false`.

[`tocomponentmodule`]: ../svg-react-transformer/README.md#tocomponentmodule

[svg-react-transformer]: ../svg-react-transformer
