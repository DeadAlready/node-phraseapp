'use strict';

module.exports = function addResourceFn(proto) {

    proto.keysGet = function keysGet(callback) {
        return this._get('/translation_keys', callback);
    };

    proto.keyPost = function keyPost(data, callback) {
        return this._post('/translation_keys', {translation_key: data}, callback);
    };

    proto.keysUpload = function keysUpload(data, callback) {
        return this._post('/translation_keys/upload', data, callback);
    };
};