# Changelog

## 2.0.2

- Updated dependencies & node to v.18

## 2.0.1

- Fix bug with svg `viewBox` sometimes being removed.

## 2.0.0

- Update svgo, which also means that given the same svg input, the optimized svg output may be different.
- Minimum Node version is now Node 8

## 1.0.6

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
