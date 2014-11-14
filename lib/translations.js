'use strict';

var prefix = '/translations';

module.exports = function returnFns(parent) {

    var child = {};

    child.store = function translationStore (data, callback) {
        return parent._postSigned(prefix + '/store', data, callback);
    };

    return child;
};
