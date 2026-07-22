// Metro : traiter les .html comme des assets bundlés (jeu HTML autonome).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('html');
module.exports = config;
