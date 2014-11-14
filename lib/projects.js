'use strict';

var prefix = '/projects';
module.exports = function returnFns(parent) {

    var child = {};
    child.getCurrent = function getCurrent (data, callback) {
        return parent._getWToken(prefix + '/current', callback);
    };

    return child;
};