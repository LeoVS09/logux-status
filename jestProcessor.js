
var babelJest = require('babel-jest')
var includeStylesSvg = new RegExp(/require\(\s*'.*\.(svg)'\)/gm)
var storeStylesSvg = new RegExp(/= require\(\s*'.*\.(svg)'\)/gm)

module.exports = {
  process: function (src, filename) {
    return babelJest
      .process(src, filename)
      .replace(includeStylesSvg, '"<svg> </svg>"')
      .replace(storeStylesSvg, '= "<svg> </svg>"')
  }
}
