var webpack = require('webpack');
require("babel-polyfill");

module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.jsx'
    ],
    module: {
        rules: [
            /*{
                enforce: 'pre',
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    formatter: require("eslint-friendly-formatter")
                }
            },*/
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output: {
        path: __dirname + '/www',
        publicPath: '/',
        filename: 'bundle.js'
    },
    watchOptions: {
        poll: true
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development'
        })
    ]
};
