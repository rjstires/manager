const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const includePath = path.resolve(__dirname, '..');

const paths = require('../config/paths');
// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = {
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.json',
      '.jsx',
    ],
    alias: {
      'src/': paths.appSrc,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: includePath,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        include: includePath,
        use: 'url-loader'
      },
      {
        test: /\.svg$/,
        loader: ['svgr/webpack'],
      },
      {
        test: /\.tsx?$/,
        include: paths.appSrc,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new TsconfigPathsPlugin({configFile: paths.appTsConfig})
  ],
};
