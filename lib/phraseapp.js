'use strict';

var request = require('request');

function Phraseapp(opts) {
    if(!(this instanceof Phraseapp)) {
        return new Phraseapp(opts);
    }
    if(typeof opts !== 'object') {
        throw new TypeError('opts [object] is required');
    }
    if(!opts.token) {
        throw new TypeError('opts.token is required');
    }

    Object.defineProperties(this, {
        apiPath: {
            value: opts.apiPath || 'https://phraseapp.com/api/v1'
        },
        tokenOpts: {
            value:  function (cOpts, url) {
                cOpts = this.opts(cOpts, url);

                var pointer;
                if (cOpts.method === 'GET' || cOpts.method === 'DELETE') {
                    cOpts.qs = cOpts.qs || {};
                    pointer = cOpts.qs;
                } else {
                    cOpts.form = cOpts.form || {};
                    pointer = cOpts.form;
                }
                pointer.auth_token = opts.token;
                return cOpts;
            }
        },
        signedOpts: {
            value: function (cOpts, url, cb) {
                if (!opts.email) {
                    throw new TypeError('opts.email is required');
                }
                if (!opts.password) {
                    throw new TypeError('opts.password is required');
                }

                cOpts = this.opts(cOpts, url);
                var pointer;

                if (cOpts.method === 'GET' || cOpts.method === 'DELETE') {
                    cOpts.qs = cOpts.qs || {};
                    pointer = cOpts.qs;
                } else {
                    cOpts.form = cOpts.form || {};
                    pointer = cOpts.form;
                }

                if (opts.user_token) {
                    pointer.auth_token = opts.user_token;
                    pointer.project_auth_token = opts.token;
                    setImmediate(cb, null, cOpts);
                    return;
                }
                this.sessions.post({
                    email: opts.email,
                    password: opts.password
                }, function (err, data) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    opts.user_token = data.auth_token;
                    pointer.auth_token = opts.user_token;
                    pointer.project_auth_token = opts.token;

                    cb(null, cOpts);
                });
            }
        },
        opts: {
            value: function (cOpts, url) {
                cOpts.uri = this._getUrl(url);
                return cOpts;
            }
        }
    });

    this.sessions = require('./sessions')(this);
    this.locales = require('./locales')(this);
    this.keys = require('./keys')(this);
    this.translations = require('./translations')(this);
}

Phraseapp.prototype._getUrl = function (url) {
    return this.apiPath + url;
};

Phraseapp.prototype._getWToken = function (url, callback) {
    return this._requestWToken({method: 'GET'}, url, callback);
};

Phraseapp.prototype._getSigned = function (url, callback) {
    return this._requestSigned({method: 'GET'}, url, callback);
};

Phraseapp.prototype._get = function (url, callback) {
    return this._request(this.opts({method: 'GET'}, url), callback);
};

Phraseapp.prototype._postWToken = function (url, data, callback) {
    return this._requestWToken({method: 'POST', form: data}, url, callback);
};

Phraseapp.prototype._postSigned = function (url, data, callback) {
    return this._requestSigned({method: 'POST', form: data}, url, callback);
};

Phraseapp.prototype._post = function (url, data, callback) {
    return this._request(this.opts({method: 'POST', form: data}, url), callback);
};

Phraseapp.prototype._putWToken = function (url, data, callback) {
    return this._requestWToken({method: 'PUT', form: data}, url, callback);
};

Phraseapp.prototype._putSigned = function (url, callback) {
    return this._requestSigned({method: 'PUT', form: data}, url, callback);
};

Phraseapp.prototype._put = function (url, callback) {
    return this._request(this.opts({method: 'PUT', form: data}, url), callback);
};

Phraseapp.prototype._patchWToken = function (url, data, callback) {
    return this._requestWToken({method: 'PATCH', form: data}, url, callback);
};

Phraseapp.prototype._patchSigned = function (url, callback) {
    return this._requestSigned({method: 'PATCH', form: data}, url, callback);
};

Phraseapp.prototype._patch = function (url, callback) {
    return this._request(this.opts({method: 'PATCH', form: data}, url), callback);
};

Phraseapp.prototype._deleteWToken = function (url, callback) {
    return this._requestWToken({method: 'DELETE'}, url, callback);
};

Phraseapp.prototype._deleteSigned = function (url, callback) {
    return this._requestSigned({method: 'DELETE'}, url, callback);
};

Phraseapp.prototype._delete = function (url, callback) {
    return this._request(this.opts({method: 'DELETE'}, url), callback);
};

Phraseapp.prototype._requestWToken = function (opts, url, callback) {
    return this._request(this.tokenOpts(opts, url), callback);
};

Phraseapp.prototype._requestSigned = function (opts, url, callback) {
    var self = this;
    self.signedOpts(opts, url, function (err, opts) {
        if(err) {
            callback(err);
            return;
        }
        self._request(opts, callback);
    });
};

Phraseapp.prototype._request = function (opts, callback) {
    if(!callback) { // No callback so return pipe
        return request(opts);
    }
    request(opts, function (error, response, body) {
        if(error) {
            callback(error);
            return;
        }
        if(response.statusCode < 200 || response.statusCode >= 300) {
            var err = new Error('Non 200 response');
            err.statusCode = response.statusCode;
            err.message = body;
            callback(err, body);
            return;
        }
        if(typeof body !== 'string' || (
            response.headers['content-type'].indexOf('application/json') === -1 &&
            response.headers['content-type'].indexOf('text/json') === -1)) {
            callback(null, body);
            return;
        }
        var parseErr = null;
        var content = false;
        try {
            content = JSON.parse(body);
            if(content.content && content.mimetype === 'application/json') {
                content = JSON.parse(content.content);
            }
        } catch(e) {
            parseErr = new Error('Malformed JSON response on ' + opts.uri);
            content = body;
        }

        callback(parseErr, content);
    });
};

module.exports = Phraseapp;