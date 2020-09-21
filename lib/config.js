var npath = require('path')
var _ = require('lodash')
var utils = require('./backend-utils/utils')

var fs = require('fs')

var p = npath.resolve

var config = {
    path: {
        root: p(__dirname + '/../../'),
        cwd: p('.')
    }
}

config.path.src = p(config.path.root + '/src')

/**
 * 搜索项目的根, 如果为 null, 做说明 matriks 没有在任何的项目中运行
 */
config.path.projectRoot = utils.traceUpPath(
    config.path.cwd,
    function(path) {
        return fs.existsSync(p(path + '/_matriks_/'))
    }
)

// if (config.path.projectRoot === null) {
//     utils.log(['info: 请注意, matriks 没有找到 matriks 的项目文件夹, 所以有些命令使用不了, 如 dev, dest 等'])
// }

module.exports = config
