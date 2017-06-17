'use strict';

const getSvgoPluginName = p => Object.keys(p)[0];

const defaultSvgoPlugins = [{ removeDoctype: true }, { removeComments: true }];
// {
//   removeAttrs: {
//     attrs: ['svg:(width|height)']
//   }
// },
// {
//   removeStyleElement: true
// },
// {
//   cleanupIDs: {
//     prefix: infile.replace(/([^a-z0-9])/g, '') + '-'
//   }
// }

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
