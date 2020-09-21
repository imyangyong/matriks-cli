var config = require('./config')
var utils = require('./backend-utils/utils')

var md5 = require('md5')
var CONSTS = require('./consts')

var sp = require('shell-promise')

var p = utils.p
var fs = require('fs')

module.exports = {
    /**
     *
     * @param opts {{
     *  isDebug: Boolean,
     *  remote: String,
     * }}
     */
    execute: function (opts) {
        opts = opts || {}

        opts.remote = opts.remote || CONSTS.DEFAULT_REMOTE

        var gitHash = md5(opts.remote)

        var homePath = p(process.env.HOME || process.env.USERPROFILE);
        var matriks2Path = p(homePath + '/.matriks2')
        var remoteMirrorsPath = p(matriks2Path + '/remotes')
        var targetRemotePath = p(remoteMirrorsPath + '/' + gitHash)

        utils.ensurePath(remoteMirrorsPath)

        var spRemotes = {
            cwd: remoteMirrorsPath,
            verbose: opts.isDebug,
        }

        var spTargetRemote = {
            cwd: targetRemotePath,
            verbose: opts.isDebug,
        }

        var promise = utils.newPromise()
        if (!fs.existsSync(targetRemotePath)) {
            promise = promise.then(function () {
                return sp('git clone ' + opts.remote + ' ' + gitHash, spRemotes)
                    .catch(function (ex) {
                        throw ex
                    })
            })
        }

        utils.log(['info: 以下是可用的 theme, 这个在 seed 项目中体现为 theme/XXX 的分支'])
        utils.log(['\n==============================\n'])

        var rgxBranchName = /(?:^|\s)[\w\-]+\/theme\/([\w\-]+)(?:$|\s)/
        promise = promise.then(function () {
            return sp('git fetch', spTargetRemote)
                .then(function() {
                    return sp('git branch -r', spTargetRemote)
                })
                .then(function(branchesResult) {
                    branchesResult.split('\n')
                        .filter(function(fullBranchName) {
                            return rgxBranchName.exec(fullBranchName)
                        })
                        .map(function(fullBranchName) {
                            var match = rgxBranchName.exec(fullBranchName)

                            var branchName = match[1]

                            utils.log([branchName])
                        })
                })
                .catch(function (ex) {
                    throw ex
                })
        })



        promise.catch(function (ex) {
            utils.log(['error: 发现错误', ex])
        })
    }
}