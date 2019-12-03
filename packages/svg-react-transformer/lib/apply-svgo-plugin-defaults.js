'use strict';

const getSvgoPluginName = p => Object.keys(p)[0];

/**
 * Combines default SVGO plugins with the user's.
 *
 * @param {Array<Object>} plugins
 * @param {string} svgId
 * @param {Array<Object>} [extraDefaults]
 * @return {Array<Object>}
 */
function applySvgoPluginDefaults(plugins, svgId, extraDefaults) {
  svgId = svgId.replace(/([^a-zA-Z0-9])/g, '');

  // All of the defaults
  let defaultSvgoPlugins = [
    { removeDoctype: true },
    { removeComments: true },
    { removeViewBox: false },
    { removeXMLNS: true },
    {
      cleanupIDs: {
        prefix: svgId + '-'
      }
    }
  ];
  if (extraDefaults) {
    defaultSvgoPlugins = defaultSvgoPlugins.concat(extraDefaults);
  }

  if (plugins === undefined) {
    return defaultSvgoPlugins;
  }

  const userPluginNames = new Set(plugins.map(getSvgoPluginName));
  const defaultedPlugins = plugins.slice();
  defaultSvgoPlugins.forEach(defaultPlugin => {
    if (userPluginNames.has(getSvgoPluginName(defaultPlugin)) === false) {
      defaultedPlugins.push(defaultPlugin);
    } else if (getSvgoPluginName(defaultPlugin) === 'removeAttrs') {
      // Merge removeAttrs attribute lists.
      const userAttrs = plugins.find(
        p => getSvgoPluginName(p) === 'removeAttrs'
      ).removeAttrs.attrs;
      const combinedAttrs = defaultPlugin.removeAttrs.attrs.concat(userAttrs);
      defaultedPlugins.push({
        removeAttrs: { attrs: combinedAttrs }
      });
    }
  });
  return defaultedPlugins;
}

module.exports = applySvgoPluginDefaults;
