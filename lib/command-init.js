var fs = require('fs')
var sp = require('shell-promise')
var utils = require('./backend-utils/utils')

var config = require('./config')
var CONSTS = require('./consts')

var del = require('delete')

var commandInit = {
    /**
     *
     * @param opts {{
         *  isForce: Boolean,
         *  isDebug: Boolean,
         *  remote: String,
         *  projectName: String,
         *  theme: String
         * }}
     */
    execute: function (opts) {
        opts = opts || {}

        utils.log(['info: 你可以使用 `-d` 选项显示更多信息'])

        if (!opts.projectName) {
            utils.log(['error: 请设置要初始化的项目名称. `matriks2 <projectName>`'])
            return
        }

        if (!opts.theme) {
            utils.log(['error: 请指定要使用的项目框架. 如 `matriks2 -t react-mobx`. 如果不确定, 可以运行 `matriks2 list-theme` 查看可用 theme'])
            return
        }

        if (config.path.projectRoot !== null) {
            utils.log(['error: 请不要在一个 matriks seed 的项目内再创建一个 matriks seed 项目.'])
            return
        }

        var targetProjectPath = utils.p(config.path.cwd + '/' + opts.projectName)
        var seedPath = utils.p(targetProjectPath + '/_matriks2_/seed')

        if (fs.existsSync(targetProjectPath)) {
            if (opts.isForce) {
                del.sync(targetProjectPath)
            } else {
                utils.log(['error: 目标项目文件夹已存在, 如果要强制覆盖, 可以使用 `-f` 选项'])
                return
            }
        }

        var spCwd = {
            cwd: config.path.cwd,
            verbose: opts.isDebug,
        }

        var spTarget = {
            cwd: targetProjectPath,
            verbose: opts.isDebug,
        }

        if (!opts.remote) {
            opts.remote = CONSTS.DEFAULT_REMOTE
        }

        // console.log('@debug, theme', opts.theme)
        return sp('git clone ' + opts.remote + ' ' + opts.projectName, spCwd)
            .then(function () {
                return sp('git checkout theme/' + opts.theme, spTarget)
            })
            .then(function () {
                del.sync(utils.p(targetProjectPath + '/.git'))
            })
            .then(function () {
                return sp('git init', spTarget)
            })
            .then(function () {
                // 把所有的子模块加入新起的 git 项目
                return sp('git add .', spTarget)
            })
            .then(function () {
                utils.logs([
                    ['info: matriks seed 新项目已创建, 请进入该文件夹, 运行 `npm install` 然后 运行 `matriks dev` 开始开发. ']
                ])
            })
            .catch(function (ex) {
                utils.log(['error: 运行错误', ex])
            })

    }
}


module.exports = commandInit
