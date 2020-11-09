# @mapbox/svg-react-transformer

[![Build Status](https://travis-ci.com/mapbox/svg-react-transformer.svg?branch=main)](https://travis-ci.com/mapbox/svg-react-transformer)

Transform SVGs into JSX or React component modules.

This monorepo includes the following packages:

- [**@mapbox/svg-react-transformer**](./packages/svg-react-transformer) includes the core, low-level transform functions to convert an SVG into JSX or React component modules. These functions take one string and output another string. They can be used by higher-level modules that target specific contexts, like the following ...
- [**@mapbox/svg-react-transformer-writer**](./packages/svg-react-transformer-writer) is a CLI and Node API for running SVG files through svg-react-transformer and writing the React component modules to new files. Takes an SVG file, outputs a JS file.
- [**@mapbox/svg-react-transformer-loader**](./packages/svg-react-transformer-loader) is a Webpack loader that transforms SVG files into React component modules. Allows you to `import` SVG files within Webpack-compiled JS and get a React component.

For example, given an SVG like this:

```svg
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<svg viewBox="0 0 18 18">
  <path d="M7,4l1.6,4H5.5c0,0-1.4-2-2.5-2H2.2L3,8l1,3h4.6L7,15h2l3.2-4H14c1,0,2-0.7,2-1.5S15,8,14,8h-1.8L9,4H7z"/>
</svg>
```

You can get a React component module like this:

```jsx
const React = require("react");

class SvgComponent extends React.PureComponent {
  render() {
    return (
      <svg viewBox="0 0 18 18" {...this.props}>
        <path d="M7 4l1.6 4H5.5S4.1 6 3 6h-.8L3 8l1 3h4.6L7 15h2l3.2-4H14c1 0 2-.7 2-1.5S15 8 14 8h-1.8L9 4H7z" />
      </svg>
    );
  }
}

module.exports = SvgComponent;
```

Or a fancier React component module like this:

```jsx
"use strict";
const React = require("react");
class SvgComponent extends React.PureComponent {
  render() {
    const containerStyle = this.props.containerStyle || {};
    if (!containerStyle.position || containerStyle.position === "static") {
      containerStyle.position = "relative";
    }
    containerStyle.paddingBottom = "100%";
    const svgStyle = this.props.svgStyle || {};
    svgStyle.position = "absolute";
    svgStyle.overflow = "hidden";
    svgStyle.top = 0;
    svgStyle.left = 0;
    svgStyle.width = "100%";
    const text = !this.props.alt ? null : (
      <div style={{ position: "absolute", left: -9999 }}>{this.props.alt}</div>
    );
    return (
      <div style={containerStyle} className={this.props.containerClassName}>
        <svg
          aria-hidden={true}
          focusable="false"
          style={svgStyle}
          className={this.props.svgClassName}
          viewBox="0 0 18 18"
        >
          <path d="M7 4l1.6 4H5.5S4.1 6 3 6h-.8L3 8l1 3h4.6L7 15h2l3.2-4H14c1 0 2-.7 2-1.5S15 8 14 8h-1.8L9 4H7z" />
        </svg>
        {text}
      </div>
    );
  }
}
module.exports = SvgComponent;
```

## Development

`npm install` to get all the dependencies and linking hooked up.
`lerna bootstrap` runs in a `postinstall` script.
(If you are experiencing errors, in linting or at runtime, about missing or fouled-up dependencies, you probably need to rerun installation & bootstrapping.)

Jest is installed at the top level, so you can test all repos by with `npx jest` or `npm test`.

Release with `mbx npm login && lerna publish --skip-npm && lerna exec mbx npm publish --tag latest`.
