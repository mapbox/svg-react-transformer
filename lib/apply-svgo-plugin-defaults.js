'use strict';

const cuid = require('cuid');
const getSvgoPluginName = p => Object.keys(p)[0];

module.exports = (plugins, svgId) => {
  svgId = svgId || cuid();
  svgId = svgId.replace(/([^a-z0-9])/g, '');
  const defaultSvgoPlugins = [
    { removeDoctype: true },
    { removeComments: true },
    { removeXMLNS: true },
    {
      cleanupIDs: {
        prefix: svgId + '-'
      }
    }
  ];

  if (plugins === undefined) {
    return defaultSvgoPlugins;
  }

  const userPluginNames = new Set(plugins.map(getSvgoPluginName));
  const defaultedPlugins = plugins.slice();
  defaultSvgoPlugins.forEach(defaultPlugin => {
    if (userPluginNames.has(getSvgoPluginName(defaultPlugin)) === false) {
      defaultedPlugins.push(defaultPlugin);
    }
  });
  return defaultedPlugins;
};
