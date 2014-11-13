'use strict';

var Phraseapp = require('./phraseapp');

module.exports = Phraseapp;
module.exports.create = function create(opts) {
    return new Phraseapp(opts);
};