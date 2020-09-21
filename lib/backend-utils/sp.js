// https://www.npmjs.com/package/shell-task

var shellpromise = require('shell-promise')
var _ = require('lodash')

var sp = function(command, opts) {
    return shellpromise(command, _.extend({verbose: true}, opts))
}

module.exports = sp;