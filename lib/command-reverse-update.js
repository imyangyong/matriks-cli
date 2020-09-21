var fs = require('fs')
var sp = require('shell-promise')
var cp = require('copy-dir')
var utils = require('./backend-utils/utils')

var config = require('./config')
var CONSTS = require('./consts')

var del = require('delete')
var p = utils.p

module.exports = {
    /**
     *
     * @param opts {{
     *  isDebug: Boolean
     * }}
     */
    execute: function(opts) {
        opts = opts || {}

        /**
         * 不 update 以 . 或 _ 开头的文件夹, 保留 node_modules
         */

        utils.log(['info: 你可以使用 `-d` 选项显示更多信息'])

        if (config.path.projectRoot === null) {
            utils.log(['error: 请在 matriks seed 项目文件夹中运行 `update` 命令.'])
            return
        }

        var seedPath = config.path.projectRoot + '/_matriks2_/seed'

        var spSeed = {
            cwd: seedPath,
            verbose: opts.isDebug,
        }

        var ignoreFiles = function(file) {
            return /^\./.exec(file) || /^_/.exec(file) || file === 'node_modules'
        }
        
        if (!fs.existsSync(seedPath)) {
            utils.log(['error: matriks seed 文件夹没有被初始化, 请考虑 `subrepo reset` 初始化一下'])
            process.exit(1)
        }

        sp('git status -s', spSeed)
            .then(function(diff) {
                if (diff && !opts.isForce) {
                    utils.log(['error: 执行 `update` 前, 请确认 /_matriks2/seed 没有未提交, 避免出现错误无法回退. 如果需要强制执行, 请使用 `-f` 选项.'])
                    process.exit(1)
                } else {

                    // 先移除当前所有有效文件
                    var files = fs.readdirSync(seedPath)

                    files.forEach(function(file) {
                        if (!ignoreFiles(file)) {
                            del.sync(p(seedPath + '/' + file))
                        }
                    })

                    // 将 seed/ 下所有文件同步过来
                    var themeFiles = fs.readdirSync(config.path.projectRoot)

                    themeFiles.forEach(function(file) {
                        if (!ignoreFiles(file)) {
                            var fromPath = p(config.path.projectRoot + '/' + file)
                            var toPath = p(seedPath + '/' + file)
                            if (fs.statSync(fromPath).isDirectory()) {
                                utils.ensurePath(toPath)
                                cp.sync(fromPath, toPath)
                            } else {
                                fs.writeFileSync(toPath, fs.readFileSync(fromPath))
                            }
                        }
                    })

                    utils.log(['info: update 完毕, 请看 git diff 以确定所需更新.'])

                    utils.log(['warn: 请注意使用 `subrepo sync` 或 `subrepo check` 同步 seed 在本项目的版本号'])
                }
            })
            .catch(function(ex) {
                utils.log(['error: 发现错误: ', ex])
            })
    }
}