'use strict';

module.exports = function addResourceFn(proto) {

    proto.localesGet = function localesGet(callback) {
        return this._get('/locales', callback);
    };

    proto.localeTranslationsGet = function localeTranslationsGet(locale, format, callback) {
        return this._get('/locales/' + locale + '.' + format, callback);
    };
};