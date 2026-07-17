const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async function ({ src, filename, options }) {
  if (filename.endsWith('.sql')) {
    // Transform SQL files into JS modules that export the SQL string
    const jsCode = `export default ${JSON.stringify(src)};`;
    return upstreamTransformer.transform({
      src: jsCode,
      filename,
      options,
    });
  }
  return upstreamTransformer.transform({ src, filename, options });
};
