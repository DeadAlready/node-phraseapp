'use strict';

var prefix = '/translation_keys';

module.exports = function returnFns(parent) {

    var child = {};

    child.get = function keysGet (callback) {
        return parent._getWToken(prefix, callback);
    };

    child.post = function keyPost (data, callback) {
        return parent._postSigned(prefix, {translation_key: data}, callback);
    };

    child.upload = function keysUpload (data, callback) {
        return parent._postSigned(prefix + '/upload', data, callback);
    };

    child.patch = function keysPatch (id, data, callback) {
        return parent._patchSigned(prefix + '/' + id, {translation_key: data}, callback);
    };

    child.delete = function keysDelete (id, callback) {
        return parent._deleteSigned(prefix + '/' + id, callback);
    };

    return child;
};