var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//Use a function here so we can check the value of the 'mode' parameter
//https://webpack.js.org/configuration/mode/
module.exports = (env, argv) => {

  if (argv.mode === 'development') {
    console.log('webpack.config.js: mode === development');
    config.devtool = 'eval-source-map';
  }

  return config;
}

var config = {
  entry: [
    './src/index.jsx'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  plugins: [
     new CleanWebpackPlugin({
      dry:false,
      
      // clean after the build to only clean obsolete assets
      cleanOnceBeforeBuildPatterns: [],

      // do not clean static assets
      cleanAfterEveryBuildPatterns: ['**/*', 
        '!libraries',
        '!libraries/**/*',
        '!.gitignore*', 
        '!App.css*', 
        '!favicon.ico*'],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new HtmlWebpackPlugin({
       inject: false,
       template: require('html-webpack-template'),

       title: 'PennAI Launchpad',
       headHtmlSnippet: `    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="libraries/semantic-ui/semantic.min.css" /> <!-- Semantic UI - 2.3.3 -->
    <link rel="stylesheet" href="App.css" />`,
       bodyHtmlSnippet: '<div id="app"></div>',
     }),
   ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: '[name].[contenthash].js',
  },
  optimization: {
      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  watchOptions: {
    poll: true
  }
};
