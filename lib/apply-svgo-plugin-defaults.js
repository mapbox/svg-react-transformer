'use strict';

const getSvgoPluginName = p => Object.keys(p)[0];

module.exports = (plugins, svgId) => {
  svgId = svgId.replace(/([^a-zA-Z0-9])/g, '');

  // All of the defaults
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
