# @mapbox/svg-react-transformer

[![Build Status](https://travis-ci.org/mapbox/svg-react-transformer.svg?branch=master)](https://travis-ci.org/mapbox/svg-react-transformer)

Transform SVGs into JSX or React component modules.

This module takes one string (the SVG) and converts it to another string (the JSX or React component module).
That low-level focus means it can be used by a variety of higher-level modules that target specific contexts.
Examples:

- [svg-react-transformer-writer](https://github.com/mapbox/svg-react-transformer-writer): A Node API and CLI for reading SVG files and writing React component module files.
- [svg-react-transformer-loader](https://github.com/mapbox/svg-react-transformer-loader): A Webpack loader for transforming SVG files into React component module files.

## Installation

```
npm install @mapbox/svg-react-transformer
```

## API

The module exposes the following functions.

- [toInlineSvg]
- [toJsx]
- [toComponentModule]

### `toInlineSvg(svg, [options])`

Returns a Promise that resolves with your SVG processed by SVGO so that it is optimized and works inline within HTML.
You could use the result with `dangerouslySetInnerHTML`, for example.
It's also used internally.

#### svg

Type: `string`
Required

The input SVG.

#### options

##### svgoPlugins

Type: `Array<Object>`

[SVGO](https://github.com/svg/svgo) plugins.

The following are all important for SVG that will be inserted inline into an HTML document, so they are automatically set (but can be overridden):

```js
[
  { removeDoctype: true },
  { removeComments: true },
  { removeXMLNS: true },
  {
    // svgId is determined by the `id` option, below.
    cleanupIDs: { prefix: svgId + '-' }
  }
]
```

##### id

Type: `string`
Default: a [`cuid`](https://github.com/ericelliott/cuid)-generated string.

Used by SVGO's `cleanupIDs` plugin to scope `id` attributes.
Any characters other than `[a-zA-Z0-9]` will be stripped.

### `toJsx(svg, [options])`

Runs an SVG through [`toInlineSvg`], then converts the SVG to JSX.
Returns a Promise that resolves with the JSX string.

#### svg

Type: `string`
Required

The input SVG.

#### options

Any of the [options for `toInlineSvg`](#options).
These are passed directly to that function.

### `toComponentModule(svg, [options])`

Runs an SVG string through [`toJsx`], then inserts the JSX into a templated React component module.
Returns a Promise that resolves with the React component module string.

#### svg

Type: `string`
Required

The input SVG.

#### options

##### svgoPlugins

Type: `Array<Object>`

See [the same option for `toInlineSvg`](#svgoplugins).

##### name

Type: `string`
Default: 'SvgComponent'

A name for the React component class.
The value will be converted to PascalCase (e.g. `fancy-pants -> FancyPants`) and then passed as the `id` option to [`toJsx`].

##### propTypes

Type: `string`

A *stringified* object defining `propTypes` for the generated React component.
It should be the string of the code that you'd put in here: `MyComponent.propTypes = ${this.place}`, e.g. `'{ title: PropTypes.string.isRequired }'`.

This value will be passed to your selected template.
If this value is defined, the built-in templates will include `const PropTypes = require('prop-types');`.

##### defaultProps

Type: `string`

A *stringified* object defining `defaultProps` for the generated React component.
It should be the string of the code that you'd put in here: `MyComponent.defaultProps = ${this.place}`, e.g. `'{ title: 'Untitled' }'`.

This value will be passed to your selected template.

##### template

Type: `Function | 'default' | 'fancy'`
Default: 'default'

If the value is a `string`, it can be one of the [component module template](#component-module-templates) values described below: [`default`](#default), [`fancy`](#fancy).

If the value is a `function`, it must be a custom template function.
This function receives as its argument a data object and must return a string.
The data object argument includes the following properties:

- `name`: The value of the `name` option above (converted to PascalCase).
- `propTypes`: The value of [the `propTypes` option](#proptypes), above.
- `defaultProps`: The value of [the `defaultProps` option](#defaultprops,) above.
- `jsxSvg`: The JSX string generated from your source SVG.
- `inlineSvg`: Your source SVG processed by SVGO for use inline with HTML.
  (In a template you could use this with `dangerouslySetInnerHTML`.)

##### precompile

Type: `boolean`
Default: `false`

If `true`, the template will be passed through Babel (with the ES2015 and React presets), so you don't have to compile it yourself.

## Component module templates

### `default` template

The default template creates a module exporting a pure component that renders the SVG element and its children as React elements.

This template is simple and unopinionated.

### `fancy` template

This is an opinionated template with a few nice features:

- Applies some accessibility patterns.
  Adds `aria-hidden` and `focusable="false"` to the `<svg>` element, and exposes an `alt` prop for alternative text (hidden from sight, legible for screen readers).
- Uses the SVG's `viewbox` attribute to determine an aspect ratio, and applies a wrapper `<div>` and CSS so that the element can have a fluid width while preserving its aspect ratio (across browsers IE11+).
- Adds extra SVGO plugins `removeTitle`, `removeStyleElement`, and `removeAttrs` to remove `width` and `height` from the `<svg>` element.
  Instead, width and height should be determined by the SVG's context.

## What about other modules that do similar things?

There are many npm packages for converting SVGs to React components.
Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc.
They are all addressing the same problem but formatting their output differently.
However, their APIs are too specialized for them to share logic, so they all end up reimplementing the same thing in different ways.

There are only a few steps here:

1. Optimize the SVG with SVGO.
2. Transform the SVG to JSX (or a React element).
3. Plug the JSX into a React component module.

Then you need an API that allows the user to configure these steps; that is, to specify SVGO plugins and control the React component output.

So that's the goal of this package: provide an API to accomplish those steps (without unnecessarily reimplementing functionality that (should) belong to other packages).
Ideally, then, this package could be *used* by Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc., and save them from reimplementing the same functionality over and over again.

[toInlineSvg]: #toinlinesvg
[toJsx]: #tojsx
[toComponentModule]: #tocomponentmodule
