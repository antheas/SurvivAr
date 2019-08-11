/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const blacklist = require("metro-config/src/defaults/blacklist");

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  },
  resolver: {
    // Without this android builds crash packager
    blacklistRE: blacklist([
      // Ignore IntelliJ directories
      /.*\.idea\/.*/,
      // ignore git directories
      /.*\.git\/.*/,
      // Ignore android directories
      /.*\/app\/build\/.*/
    ])
  }
};
