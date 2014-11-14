'use strict';

var prefix = '/sessions';

module.exports = function returnFns(parent) {

    var child = {};

    child.post = function sessionPost(data, callback) {
        return parent._post(prefix, data, callback);
    };

    child.delete = function sessionDelete(data, callback) {
        return parent._deleteWToken(prefix, data, callback);
    };

    child.checkLogin = function checkLogin(callback) {
        return parent._getWToken('/auth/check_login', callback);
    };

    return child;
};