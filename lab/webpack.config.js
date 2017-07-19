var webpack = require('webpack');

module.exports = {
    entry: [
        'webpack/hot/only-dev-server',
        './src/index.jsx'
    ],
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    formatter: require("eslint-friendly-formatter")
                }
            },
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                loader: 'react-hot-loader!babel-loader'
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
    devServer: {
        contentBase: './www',
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};
