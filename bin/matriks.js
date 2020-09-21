#!/usr/bin/env node

var commander = require('commander')

var config = require('../lib/config')
var utils = require('../lib/backend-utils/utils')

// commander.command('init <projectName>')
//     .option('-f, --force')
//     .option('-r, --remote <remote>')
//     .option('-t, --theme <theme>')
//     .option('-d, --debug')
//     .action(function(projectName, opts) {
//         require('../lib/command-init').execute({
//             isForce: opts.force,
//             isDebug: opts.debug,
//             remote: opts.remote,
//             theme: opts.theme,
//             projectName: projectName
//         })
//     })


// 暂不考虑自动化 update 和 reverse-update, 因为自动化更新在没有完全分离种子 + 业务代码的情况下不靠谱
// commander.command('update')
//     .option('-f, --force')
//     .option('-d, --debug')
//     .action(function() {
//         require('../lib/command-update').execute({
//             isForce: opts.force,
//             isDebug: opts.debug,
//         })
//     })
//
// commander.command('reverse-update')
//     .option('-f, --force')
//     .option('-d, --debug')
//     .action(function(opts) {
//         require('../lib/command-reverse-update').execute({
//             isForce: opts.force,
//             isDebug: opts.debug,
//         })
//     })

// commander.command('version')
//     .action(function() {
//         require('../lib/command-version').execute()
//     })
//
// commander.command('list-theme [remote]')
//     .option('-d, --debug')
//     .action(function(remote, opts) {
//         require('../lib/command-list-theme').execute({
//             isDebug: opts.debug,
//             remote: opts.remote,
//         })
//     })

if (config.path.projectRoot !== null) {
    try {
        require(utils.p(config.path.projectRoot + '/link/matriks-command-line.js'))({
            commander: commander
        })
    } catch(ex) {
        utils.log(['出现错误 : ', ex])
        utils.log(['warn: 是否 matriks 项目还没有初始化, 因此有一些命令还不能执行? 如要运行, 请预设 link/matriks-command-line.js 入口文件'])
    }
}

utils.warningOnUnknownSubCommand(commander)

commander.parse(process.argv)

utils.warningOnNoSubCommand(commander)
