/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var http = require('http');
var express = require('express');

/**
 * @class Jii.controller.httpServer.HttpServer
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.controller.httpServer.HttpServer', Jii.base.Component, {

    host: '0.0.0.0',
    port: 3000,

    /**
     * @type {Jii.controller.UrlManager|string}
     */
    urlManager: 'urlManager',

    _express: null,
    _server: null,

    init: function () {
        this._express = new express();
        this._express.use(express.json());
        this._express.use(express.urlencoded());

        // Subscribe on all requests
        this._express.all('*', this._onRoute.bind(this));

        if (_.isString(this.urlManager)) {
            this.urlManager = Jii.app.getComponent(this.urlManager);
        }
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
     * @param {object} expressRequest
     * @param {object} expressResponse
     * @private
     */
    _onRoute: function (expressRequest, expressResponse) {
        var request = new Jii.controller.httpServer.Request(expressRequest);
        var result = this.urlManager.parseRequest(request);
        console.log(result);

            /*var result = Jii.app.getUrlManager().parseRequest(this);
            if (result !== false) {
                list ($route, $params) = $result;
                 $_GET = array_merge($_GET, $params);
                 return [$route, $_GET];
            }
            throw new Jii.exceptions.InvalidRouteException(Jii.t('jii', 'Page not found.'));*/

        expressResponse.send('<form method=POST><input name=qwe /></form>');
        /*var runDeferred = null;

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
        }.bind(this));*/
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
