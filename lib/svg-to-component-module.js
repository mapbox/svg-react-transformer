'use strict';

const _ = require('lodash');
const prettier = require('prettier');
const pascalCase = require('pascal-case');
const svgToJsx = require('./svg-to-jsx');

const defaultTemplate = data => {
  const componentName = pascalCase(data.name);
  let propTypes = '';
  if (data.propTypes !== undefined) {
    propTypes = `\n{
      ${_.map(data.propTypes, (v, k) => `${v}: ${k},`)}
    };\n`;
  }
  const svgJsxWithProps = data.svgJsx.replace(/^<svg/, '<svg {...this.props}');
  const js = `
    'use strict';
    const React = require('react');

    class ${componentName} extends React.PureComponent {
      render() { return ${svgJsxWithProps}; }
    }
    ${propTypes}
    module.exports = ${componentName};
  `;
  return prettier.format(js);
};

module.exports = (svg, options) => {
  options = options || {};

  return svgToJsx(svg, { svgoPlugins: options.svgoPlugins }).then(svgJsx => {
    const templateData = Object.assign(
      {
        svgJsx
      },
      _.omit(options, ['template', 'svgoPlugins'])
    );

    if (options.template) return options.template(templateData);
    return defaultTemplate(templateData);
  });
};
