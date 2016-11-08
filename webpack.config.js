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

module.exports = {
    devtool: 'source-map',
    context: path.join(__dirname, './lib'),
    target: 'web',
    entry: {
      vendor: [ 'lodash',
                'react',
                'react-dom',
                'react-bootstrap',
                'react-router',
                'react-router-bootstrap',
                'react-intl',
                'moment',
                'bootstrap-sass!./style/bootstrap-sass.config.js',
               ],
//      auth: ['./bundle/auth/index.js'],
//      dashboard: ['./bundle/dashboard/index.js'],
//      user: ['./bundle/user/index.js'],
      app: './App.jsx',
    },

    output: {
        path: __dirname + '/dist',
        filename: "dist/[name].js",
		  chunkFilename: "dist/[id].chunk.js",
    },

    module: {
        loaders: [
            {test: /\.jsx?$/,                   loaders: ['babel?cacheDirectory=true'], exclude: /node_modules/ },
            {test: /\.js$/,                     loader:  'babel-loader', include: /node_modules\/react-hotkeys/ },
            {test: /\.css$/,                    loader:  ExtractTextPlugin.extract('style', 'css-loader') },
            {test: /\.s[ca]ss$/,                loader:  ExtractTextPlugin.extract('style', 'css-loader!sass-loader') },
            {test: /\.(woff|woff2)$/,           loader:  'url-loader?limit=100000' },
            {test: /\.(ttf|eot)$/,              loader:  'file-loader' },
            {test: /\.(png|jpg|jpeg|gif|svg)$/, loader:  'url-loader?limit=10000' },
            {test: /\.json$/, loader:  'json-loader' },
            {test: /\.html$/, loader:  'file-loader?name=[path][name].[ext]' }
        ]
    },

    resolve: {
      extensions: ['', '.js', '.jsx'],
      modules: [
         path.resolve('./lib'),
         'node_modules',
      ]
    },

    extensions: ['.jsx', '.js'],

    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
         name: 'vendor',
         //minChunks: Infinity,
         filename: 'dist/vendor.bundle.js',
      }),
      new webpack.NoErrorsPlugin(),
      new WebpackNotifierPlugin(),
      new ExtractTextPlugin("bundle.css")
    ]
}
