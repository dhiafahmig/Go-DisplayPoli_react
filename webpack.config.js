const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      path: false,
      fs: false,
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|mp3|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
}; 