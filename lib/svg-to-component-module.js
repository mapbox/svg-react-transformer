'use strict';

const _ = require('lodash');
const prettier = require('prettier');
const pascalCase = require('pascal-case');
const svgToJsx = require('./svg-to-jsx');

const defaultTemplate = data => {
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

module.exports = (svg, options) => {
  options = options || {};

  const svgToJsxOptions = {
    svgoPlugins: options.svgoPlugins,
    id: options.name
  };
  return svgToJsx(svg, svgToJsxOptions).then(svgJsx => {
    const templateData = Object.assign(
      _.omit(options, ['template', 'svgoPlugins']),
      {
        svgJsx,
        name: options.name !== undefined
          ? pascalCase(options.name)
          : 'SvgComponent'
      }
    );

    if (options.template) return options.template(templateData);
    return defaultTemplate(templateData);
  });
};
