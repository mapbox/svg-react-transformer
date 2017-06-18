# svg-react-transformer

[![Build Status](https://travis-ci.org/mapbox/svg-react-transformer.svg?branch=master)](https://travis-ci.org/mapbox/svg-react-transformer)

Transform SVG into JSX or React component modules.

## API

The module exposes two functions.

### `svgToJsx`

`svgToJsx(svg: string, options?: Object): Promise<string>`

Runs an SVG string through SVGO, then converts the output to JSX.
Returns a Promise that resolves with the JSX string.

Options:

- **svgoPlugins**: `?Array<Object>` - [SVGO](https://github.com/svg/svgo) plugins.
  The following are automatically set, so no need to add them:
  ```js
  [
    { removeDoctype: true },
    { removeComments: true },
    { removeXMLNS: true }
  ]
  ```

### `svgToComponentModule`

`svgToComponentModule(svg: string, options?: Object): Promise<string>`

Runs an SVG string through `svgToJsx` (above), then inserts the JSX into a templated React component module.
Returns a Promise that resolves with the React component module string.

Options:
- **svgoPlugins**: `?Array<Object>` - See the same option for `svgToJsx` (above).
- **name**: `?string` - Default: 'SvgComponent'.
  A name for the component class.
  Will be converted to PascalCase.
- **propTypes**: `?string` - A stringified object defining `propTypes` for the generated React component.
  It should be the string of the code that you'd put in here: `MyComponent.propTypes = ${this.place}`.
  If this option is provided, the default template will include `const PropTypes = require('prop-types');`.
- **defaultProps**: `?string` - A stringified object defining `defaultProps` for the generated React component.
  It should be the string of the code that you'd put in here: `MyComponent.defaultProps = ${this.place}`.
- **template**: `?Function` - An alternative template function.
  Receives as its argument a data object and must return a string.
  Data includes:
  - `name`: The value of the `name` option above (converted to PascalCase).
  - `propTypes`: The value of the `propTypes` option above.
  - `defaultProps`: The value of the `defaultProps` option above.
  - `svgJsx`: The JSX string generated from your source SVG.

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
You just need to expose its options.

The second step ("Transform the SVG to JSX (or a React element).") is reimplemented in a hundred different ways.
But this problem should be outsourced to another, more low-level package, because transforming HTML and XML to React components is not a problem specific to SVG. (See [html-to-react](https://github.com/aknuds1/html-to-react) and [htmltojsx](https://www.npmjs.com/package/htmltojsx).)

The third step ("Plug the JSX into a React component module.") is also not really a problem to be solved, because we have template literals and other means of templating.

So (as long as you outsource the second step), *there is actually no problem to be solved, just an API to provide.*

That's the goal of this package: provide an API to accomplish those steps (without unnecessarily reimplementing functionality that (should) belong to other packages). Ideally, then, this package could be *used* by Webpack loaders, Browserify transforms, CLIs, Gulp plugins, etc., to save them from reimplementing the same functionality over and over again.
