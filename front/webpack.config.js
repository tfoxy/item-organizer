const HtmlWebpackPlugin = require('html-webpack-plugin');

const proxyHost = process.env.PROXY_HOST || 'localhost';
const devServerPort = process.env.PORT || '8080';

module.exports = {
  output: {
    publicPath: '/static/build',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    }, {
      test: /\.html$/,
      use: 'html-loader',
    }, {
    test: /\.svg$/,
    use: 'svg-inline-loader',
  }],
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  devServer: {
    proxy: [{
      context: path => path === '/',
      target: `http://localhost:${devServerPort}/static/build/index.html`,
    }, {
      context: '**',
      target: `http://${proxyHost}:8000`,
      changeOrigin: true,
    }],
  },
};
