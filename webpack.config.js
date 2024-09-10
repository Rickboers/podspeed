const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content.js',
    popup: './src/popup.js',
    background: './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/popup.html", to: "popup.html" },
        { from: "dist/manifest.json", to: "manifest.json" },
      ],
    }),
  ],
  mode: 'production',
};