'use strict';

module.exports = function addResourceFn(proto) {

    proto.translationStore = function translationStore(data, callback) {
        return this._post('/translations/store', data, callback);
    };

};