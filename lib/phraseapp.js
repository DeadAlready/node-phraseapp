'use strict';

var request = require('request');
request.debug = true;

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
        project: {
            value: opts.project
        },
        opts: {
            value: function (currentOpts, url, cb) {
                currentOpts.uri = this._getUrl(url);
                if(currentOpts.method === 'GET' || currentOpts.method === 'DELETE') {
                    currentOpts.qs = currentOpts.qs || {};
                    currentOpts.qs.auth_token = opts.token;
                    setImmediate(cb, null, currentOpts);
                    return;
                }
                currentOpts.form = currentOpts.form || {};
                if(opts.user_token) {
                    currentOpts.form.auth_token = opts.user_token;
                    currentOpts.form.project_auth_token = opts.token;
                    setImmediate(cb, null, currentOpts);
                    return;
                }
                this.authenticate(function (err) {
                    if(err) {
                        cb(err);
                        return;
                    }
                    currentOpts.form.auth_token = opts.user_token;
                    currentOpts.form.project_auth_token = opts.token;
                    cb(null, currentOpts);
                });
            }
        },
        authenticate: {
            value: function (cb) {
                if(!opts.email) {
                    throw new TypeError('opts.email is required');
                }
                if(!opts.password) {
                    throw new TypeError('opts.password is required');
                }

                this._request({
                    uri: this._getUrl('/sessions'),
                    method: 'POST',
                    form: {
                        email: opts.email,
                        password: opts.password
                    }
                }, function (err, data) {
                    if(err) {
                        cb(err);
                        return;
                    }
                    opts.user_token = data.auth_token;
                    cb();
                });
            }
        }
    });
}

Phraseapp.prototype._getUrl = function (url) {
    return this.apiPath + url;
};

Phraseapp.prototype._get = function (url, callback) {
    var self = this;
    self.opts({method: 'GET'}, url, function (err, opts) {
        if(err) {
            callback(err);
            return;
        }
        self._request(opts, callback);
    });
};

Phraseapp.prototype._post = function (url, data, callback) {
    var self = this;
    self.opts({method: 'POST', form: data}, url, function (err, opts) {
        if(err) {
            callback(err);
            return;
        }
        self._request(opts, callback);
    });
};

Phraseapp.prototype._put = function (url, data, callback) {
    var self = this;
    self.opts({method: 'PUT', form: data}, url, function (err, opts) {
        if(err) {
            callback(err);
            return;
        }
        self._request(opts, callback);
    });
};

Phraseapp.prototype._delete = function (url, callback) {
    var self = this;
    self.opts({method: 'DELETE'}, url, function (err, opts) {
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
        if(typeof body !== 'string' || response.headers['content-type'].indexOf('application/json') === -1) {
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

require('./locales')(Phraseapp.prototype);
require('./keys')(Phraseapp.prototype);
require('./translations')(Phraseapp.prototype);

module.exports = Phraseapp;