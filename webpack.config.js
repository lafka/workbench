var
  webpack = require('webpack'),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),
  WebpackNotifierPlugin = require('webpack-notifier'),
  path = require('path')


var amendSources = function(sources) {
  //if (process.env.NODE_ENV !== 'production') {
  //  sources.unshift('webpack/hot/only-dev-server');
  //}

  return sources
}

const production = process.env.NODE_ENV !== 'production'
module.exports = {
    target: 'web',
    entry: ['./lib/App.jsx'],

    output: {
        path: __dirname + '/dist',
        filename: "dist/app.js",
    },

    devtool: 'cheap-module-source-map',

    performance: {
      maxEntrypointSize: production ? 250000 : 5000000,
      maxAssetSize: production ? 250000 : 5000000,
      hints: false
    },

    module: {
        rules: [
            {test: /\.jsx$/, enforce: "pre", loader: "eslint-loader", exclude: /node_modules/},
            {
               test: /(\.scss|\.sass|\.css)$/,
               loader: ExtractTextPlugin.extract({
                  fallbackLoader: 'style-loader',
                  loader: ['css-loader', 'sass-loader']
               })
            },
            {test: /\.(js|jsx)$/,               use: [{loader: 'babel-loader'}], exclude: /node_modules/},
            {test: /\.(woff|woff2)$/,           use: [{loader: 'url-loader?limit=100000'}]},
            {test: /\.(png|jpg|jpeg|gif|svg)$/, use: [{loader: 'url-loader?limit=100000'}]},
            {test: /\.(ttf|eot)$/,              use: [{loader: 'file-loader'}]}
        ]
    },

    resolve: {
      extensions: ['.js', '.jsx'],
      modules: [
         path.resolve('./lib'),
         'node_modules',
      ]
    },

    plugins: [
      //new webpack.optimize.CommonsChunkPlugin({name: 'vendor'}),
      new webpack.NoErrorsPlugin(),
      new WebpackNotifierPlugin(),
      new ExtractTextPlugin({ filename: "dist/bundle.css", disable: false, allChunks: true })
    ]
}
