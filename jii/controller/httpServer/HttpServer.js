/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var http = require('http');
var express = require('express');

/**
 * @class Jii.controllers.HttpServer
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.controllers.HttpServer', Jii.base.Component, {

    host: '0.0.0.0',
    port: 3000,
    _express: null,
    _server: null,

    init: function () {
        this._express = new express();
        this._express.use(express.json());
        this._express.use(express.urlencoded());

        // Subscribe on all requests
        this._express.all('*', this._onRoute.bind(this));
    },

    /**
     * Start listen http queries
     */
    start: function () {
        Jii.app.logger.info('Start http server, listening `%s`.', this.host + ':' + this.port);
        this._server = http.createServer(this._express).listen(this.port, this.host);
    },

    /**
     * Stop listen http port
     */
    stop: function () {
        this._server.close();
        Jii.app.logger.info('Http server is stopped.');
    },

    /**
     * @param {object} request
     * @param {object} response
     * @private
     */
    _onRoute: function (request, response) {
        var runDeferred = null;

        if (request.method === 'OPTIONS') {
            runDeferred = this.runAction('jii/accessControl', request, response);
        } else {
            var path = request.route.path;
            path = path.substr(1, path.length);
            if (!_.has(this.routes, path)) {
                throw new Jii.exceptions.ApplicationException('Route `' + route + '` is not registered in config.');
            }

            var route = this.routes[path];
            runDeferred = this.runAction(route, request, response);
        }

        runDeferred.always(function(action) {
            Joints.when(action.deferred).always(function() {
                this._sendAction(action);
            }.bind(this));
        }.bind(this));
    },

    _sendAction: function(action) {
        this._super(action);

        // @todo

        // Set headers
        action._expressResponse.set(action.headers);

        // Set or clear cookies
        _.each(action.cookies, function(key, params) {
            if (params.value === null) {
                action._expressResponse.clearCookie(key, params.params);
            } else {
                action._expressResponse.cookie(key, params.value, params.params);
            }
        });

        // Set status code
        action._expressResponse.status(action.statusCode);

        // Set data and send
        if (action.params.callback) {
            action._expressResponse.jsonp(action.data);
        } else {
            action._expressResponse.send(action.data);
        }
    }
});