const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;

config.resolver.sourceExts.push("cjs");
