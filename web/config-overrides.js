const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// module.exports = function override(config, env) {
//     config.plugins.push(new MonacoWebpackPlugin({
//         languages: ['json', 'sql']
//     }));
//     return config;
// }
module.exports = {
  // ...
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['json', 'sql'] // 指定需要的语言
    }),
  ],
  // ...
};