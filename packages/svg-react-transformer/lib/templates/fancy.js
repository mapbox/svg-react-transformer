'use strict';

const _ = require('lodash');
const prettier = require('prettier');

function fancy(data) {
  const viewboxMatch = data.jsxSvg.match(
    /viewBox="(?:\S+\s+){2}([\d.]+)\s+([\d.]+)"/
  );
  const defaultWidth = viewboxMatch[1];
  const defaultHeight = viewboxMatch[2];
  const ratio = _.round(defaultHeight / defaultWidth * 100, 2);

  const svg = data.jsxSvg.replace(
    /^<svg/,
    `<svg aria-hidden={true}
      focusable="false"
      style={svgStyle}
      className={this.props.svgClassName}`
  );

  const js = `
    'use strict';
    const React = require('react');
    class ${data.name} extends React.PureComponent {
      render() {
        const containerStyle = this.props.containerStyle || {};
        if (!containerStyle.position || containerStyle.position === 'static') {
          containerStyle.position = 'relative';
        }
        containerStyle.paddingBottom = '${ratio}%';
        const svgStyle = this.props.svgStyle || {};
        svgStyle.position = 'absolute';
        svgStyle.overflow = 'hidden';
        svgStyle.top = 0;
        svgStyle.left = 0;
        svgStyle.width = '100%';
        const text = !this.props.alt ? null : (
          <div style={{ position: 'absolute', left: -9999 }}>
            {this.props.alt}
          </div>
        );
        return (
          <div
            style={containerStyle}
            className={this.props.containerClassName}
          >
            ${svg}
            {text}
          </div>
        )
      }
    }
    module.exports = ${data.name};
  `;

  return prettier.format(js);
}

module.exports = fancy;
