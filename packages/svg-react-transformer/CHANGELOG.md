# Changelog

## HEAD

- Remove dependency on Prettier, which also means the output of the provided templates is not prettified.

## 1.0.5

- Fix bug with converting `style` attribute strings to JSX objects in `svg-react-transformer`'s `toJsx` function.

## 1.0.4

- `'fancy'` template clones `containerStyle` and `svgStyle` props instead of mutating them.

## 1.0.3

- `'fancy'` template exports a `PureComponent` instead of one that never updates.
  This allows for dynamic style changes of the SVG or its container element.

## 1.0.2

- First Lerna monorepo release.

## 1.0.1

- In `'default'` template, move `{...this.props}` to *end* of the element so it can override existing attributes on the SVG.

## 1.0.0

- Start this log.
