var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path')

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.png$/, use: 'url-loader' },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      filename: 'index.html'
    }),
    new ScriptExtHtmlWebpackPlugin({ inline: 'bundle' })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build')
  }
}
