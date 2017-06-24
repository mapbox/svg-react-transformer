'use strict';

const prettier = require('prettier');

module.exports = data => {
  let propTypesRequire = '';
  let propTypes = '';
  let defaultProps = '';
  if (data.propTypes !== undefined) {
    propTypesRequire = `const PropTypes = require('prop-types');\n`;
    propTypes = `\n${data.name}.propTypes = ${data.propTypes}\n`;
  }
  if (data.defaultProps !== undefined) {
    defaultProps = `\n${data.name}.defaultProps = ${data.defaultProps}\n`;
  }
  const svgJsxWithProps = data.svgJsx.replace(/^<svg/, '<svg {...this.props}');
  const js = `
    'use strict';
    const React = require('react');
    ${propTypesRequire}
    class ${data.name} extends React.PureComponent {
      render() { return ${svgJsxWithProps}; }
    }
    ${propTypes}${defaultProps}
    module.exports = ${data.name};
  `;
  return prettier.format(js);
};
