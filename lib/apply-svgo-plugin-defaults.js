'use strict';

const getSvgoPluginName = p => Object.keys(p)[0];

const defaultSvgoPlugins = [
  { removeDoctype: true },
  { removeComments: true },
  { removeXMLNS: true }
];

module.exports = plugins => {
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
