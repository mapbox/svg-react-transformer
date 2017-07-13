'use strict';

const prettier = require('prettier');
const svgstore = require('svgstore');

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

  const symbolComponentName = `${data.name}Symbol`;
  const svgElement = svgstore().add(symbolComponentName, data.inlineSvg)
    .element;

  const user = `<svg {...this.props}>
    <use xlinkHref="#${symbolComponentName}" />
  </svg>`;

  const js = `
    'use strict';
    const React = require('react');
    const ReactDOM = require('react-dom');
    ${propTypesRequire}
    class ${symbolComponentName} extends React.PureComponent {
      shouldComponentUpdate() {
        return false;
      }
      render() {
        return (
          <div dangerouslySetInnerHTML={{ __html: \`${svgElement.xml()}\`}} />
        );
      }
    }

    let userCount = 0;
    let symbolIsMounted = false;
    let symbolContainer;
    const mountSymbol = () => {
      if (userCount !== 0 || symbolIsMounted) return;
      symbolIsMounted = true;
      if (!symbolContainer) {
        symbolContainer = document.createElement('div');
        symbolContainer.style.display = 'none';
        document.body.appendChild(symbolContainer);
      }
      ReactDOM.render(<${symbolComponentName} />, symbolContainer);
    };
    const unmountSymbol = () => {
      if (userCount !== 0 || !symbolIsMounted) return;
      symbolIsMounted = false;
      ReactDOM.unmountComponentAtNode(symbolContainer);
    };

    class ${data.name} extends React.PureComponent {
      componentDidMount() {
        mountSymbol();
        userCount += 1;
      }
      componentWillUnmount() {
        userCount -= 1;
        unmountSymbol();
      }
      render() { return ${user}; }
    }
    ${propTypes}${defaultProps}
    module.exports = ${data.name};
  `;
  return prettier.format(js);
};
