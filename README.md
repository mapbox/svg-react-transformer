# @mapbox/svg-react-transformer

[![Build Status](https://travis-ci.org/mapbox/svg-react-transformer.svg?branch=master)](https://travis-ci.org/mapbox/svg-react-transformer)

Transform SVGs into JSX or React component modules.

This module takes one string (SVG) and converts it to another string (JSX or React component module).
That low-level focus means it can be used by a variety of higher-level modules that target specific contexts.
Examples:

- [svg-react-transformer-writer](https://github.com/mapbox/svg-react-transformer-writer): A Node API and CLI for reading SVG files and writing React component module files.
- [svg-react-transformer-loader](https://github.com/mapbox/svg-react-transformer-loader): A Webpack loader for transforming SVG files into React component module files.

## API

The module exposes the following functions.

- [toInlineSvg]
- [toJsx]
- [toComponentModule]

### `toInlineSvg`

`toInlineSvg(svg: string, options?: Object): Promise<string>`

Returns a Promsie that resolves with your SVG processed by SVGO so that it is optimized and works inline with HTML.

You could use the result with `dangerouslySetInnerHTML`.

**Options** (none required)

- **svgoPlugins**: `?Array<Object>` - [SVGO](https://github.com/svg/svgo) plugins.
  The following are all important for SVG that will be inserted inline into a document, so they are automatically set (but can be overridden):
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
- **id**: `?string` - Default: a [`cuid`](https://github.com/ericelliott/cuid)-generated string.
  Use by SVGO's `cleanupIDs` plugin to scope `id` attributes.
  Any characters other than `[a-zA-Z0-9]` will be stripped.

### `toJsx`

`toJsx(svg: string, options?: Object): Promise<string>`

Returns a Promise that resolves with the JSX string.

**Options** (none required)

- Any of the options for [toInlineSvg], which are passed directly to that function.

### `toComponentModule`

`toComponentModule(svg: string, options?: Object): Promise<string>`

Runs an SVG string through [`toJsx`], then inserts the JSX into a templated React component module.
Returns a Promise that resolves with the React component module string.

**Options** (none required)

- **svgoPlugins**: `?Array<Object>` - See the same option for [`toInlineSvg`].
- **name**: `?string` - Default: 'SvgComponent'.
  A name for the component class.
  Will be converted to PascalCase.
  Also, will be passed as the `id` option to [`toJsx`].
- **propTypes**: `?string` - A stringified object defining `propTypes` for the generated React component.
  It should be the string of the code that you'd put in here: `MyComponent.propTypes = ${this.place}`.
  If this option is provided, the default template will include `const PropTypes = require('prop-types');`.
- **defaultProps**: `?string` - A stringified object defining `defaultProps` for the generated React component.
  It should be the string of the code that you'd put in here: `MyComponent.defaultProps = ${this.place}`.
- **template**: `string | Function | void` - If a `string`, can be one of the [component module template](#component-module-templates) values described below: `default`, `useSymbol`.
  The default value is `default`.
  If a `function`, it is an alternative template function.
  Receives as its argument a data object and must return a string.
  Data includes:
  - `name`: The value of the `name` option above (converted to PascalCase).
  - `propTypes`: The value of the `propTypes` option above.
  - `defaultProps`: The value of the `defaultProps` option above.
  - `jsxSvg`: The JSX string generated from your source SVG.
  - `inlineSvg`: Your source SVG processed by SVGO for use inline with HTML.
    In a template you could use this with `dangerouslySetInnerHTML`.

## Component module templates

### `default` template

The default template creates a module exporting a component that renders the SVG element and its children as React elements.

Be aware that this renders the full SVG every time it's used.
If you use `React.renderToString`, then, you will be repeating that SVG's markup as often as you use it.
Maybe you don't care.
But if you want to avoid this, consider the `useSymbol` template.

### `useSymbol` template

This template creates two components:
- one that renders your SVG transformed into a `<symbol>` (by [svgstore](https://github.com/svgstore/svgstore));
- one that renders a `<use>` tag that references the `<symbol>`.

The module only exports the component that renders a `<use>` tag.
Internally, this component uses `react-dom` to render the `<symbol>` component *as needed*.
If the `<use>` component is used multiple times, only one `<symbol>` will render.
If all `<use>` components are removed, the `<symbol>` is also removed.

This template may be more efficient than the `default` template if you render the same SVG many times.

There is an important caveat: If you `React.renderToString`, the `<symbol>` component will not be included in that HTML string.
It will only be rendered after the first `<use>` component mounts.

### `fancy` template

This is an opinionated template with a few distinguishing features:

- Applies some accessibility patterns.
  Adds `aria-hidden` and `focusable="false"` to the `<svg>` element, and exposes an `alt` prop for alternative text (hidden from sight, legible for screen readers).
- Uses the SVG's `viewbox` attribute to determine an aspect ratio, and applies a wrapper `<div>` and CSS so that the element can have a fluid width while preserving the aspect ratio (across browsers).
- Adds extra SVGO plugins `removeTitle`, `removeStyleElement`, and `removeAttrs` to remove `width` and `height` from the `<svg>` element.

## What about other modules that do similar things?

There are many, many npm packages for converting SVGs to React components.
Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc.
They are all addressing the same problem but formatting their output differently.
However, their APIs are too specialized for them to share logic, so they all end up reimplementing the same thing in different ways.

There are only a few steps here:
1. Optimize the SVG with SVGO.
2. Transform the SVG to JSX (or a React element).
3. Plug the JSX into a React component module.

Then you need an API that allows the user to configure these steps; that is, to specify SVGO plugins or control the React component output.

Turns out the first step ("Optimize the SVG with SVGO.") is not really a problem to be solved.
SVGO works on its own.
You just need to provide smart defaults for inline SVG and expose an API to add more options.

The second step ("Transform the SVG to JSX (or a React element).") is reimplemented in many different ways.
For packages that target a specific context, though, like a Webpack loader or a Babel plugin, this problem should be outsourced to another, more low-level package that can be shared.
Transforming HTML and XML to React components is not a problem specific to any of them.

The third step ("Plug the JSX into a React component module.") is not too difficult, because we have template literals and other means of templating, but smart defaults help.

So (as long as you outsource the second step), *there is actually not much of a problem to be solved, just an API to provide.*

That's the goal of this package: provide an API to accomplish those steps (without unnecessarily reimplementing functionality that (should) belong to other packages).
Ideally, then, this package could be *used* by Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc., to save them from reimplementing the same functionality over and over again.


[toInlineSvg]: #toinlinesvg
[toJsx]: #tojsx
[toComponentModule]: #tocomponentmodule
