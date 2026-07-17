const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve .sql files for Drizzle migrations
config.resolver.sourceExts.push('sql');

// Use custom transformer to convert .sql files into JS string exports
config.transformer.babelTransformerPath = require.resolve('./metro-sql-transformer.js');

module.exports = withNativeWind(config, { input: './global.css' });
