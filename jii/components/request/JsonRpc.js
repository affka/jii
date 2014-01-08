/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * Component for exchange data with server via protocol JSON-RPC
 * @class Jii.components.request.JsonRpc
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.request.JsonRpc', Jii.base.Component, {

    /**
     * Default Url to backend api
     * @type {string}
     */
    apiUrl: '',

    /**
     * In milliseconds
     * @type {boolean|number}
     */
    simulateSlowRequests: false,

    /**
     * RPC protocol version number
     * @type {string}
     */
    _version: '2.0',

    _isAccumulate: false,
    _accumulatedRequests: [],
    _globalId: 0,

    /**
     * Main method for send request
     * @param {string} method
     * @param {object} options
     * @param {object} [options.params]
     * @param {function} [options.success]
     * @param {function} [options.error]
     * @param {object} [context]
     * @return {Joints.Deferred}
     */
    send: function (method, options, context) {
        // set defaults
        context = context || this;
        options = options || {};
        options.params = options.params || {};

        // Validate params
        if (!_.isNull(options.params) && !_.isUndefined(options.params) && !_.isObject(options.params) && !_.isArray(options.params)) {
            throw new Jii.exceptions.ApplicationException("Invalid params supplied for jsonRPC request. It must be empty, an object or an array.");
        }

        // namespace option
        if (_.has(options, 'namespace')) {
            method = options.namespace + '.' + method;
        }

        var request = {
            id: this._globalId++,
            method: method,
            params: options.params,
            deferred: Joints.Deferred()
        };

        if (this._isAccumulate) {
            this._accumulatedRequests.push(request);
        } else {
            this._invokeRequests(request);
        }

        if (options.success) {
            request.deferred.done(_.bind(options.success, context));
            delete options.success;
        }
        if (options.error) {
            request.deferred.fail(_.bind(options.error, context));
            delete options.error;
        }

        return request.deferred;
    },

    /**
     * Store requests in cache, not sending it. For send all accumulated requests
     * call sendAccumulated() method.
     */
    accumulate: function () {
        this._isAccumulate = true;
    },

    /**
     * Send all stored requests and clean storage
     * See also method accumulate()
     */
    sendAccumulated: function () {
        Jii.app.logger.info('Send rpc batch requests.');

        this._isAccumulate = false;

        if (this._accumulatedRequests.length === 0) {
            return;
        }

        this._invokeRequests(this._accumulatedRequests);
        this._accumulatedRequests = [];
    },

    /**
     *
     * @param {object|null} params
     * @returns {Jii.components.request.proxy.JsonRpcProxy}
     */
    createProxy: function(params) {
        var proxy = new Jii.components.request.proxy.JsonRpcProxy();
        proxy.init();

        params.request = this;
        proxy.setConfiguration(params);

        return proxy;
    },

    /**
     * Send all requests on server
     * @param {object|array} requests
     * @param {boolean} [notSlowRequest]
     */
    _invokeRequests: function (requests, notSlowRequest) {
        // Run event
        this.trigger('beforeRequest');

        if (!notSlowRequest && this.simulateSlowRequests) {
            Jii.app.logger.debug('Simulation of slow request. wait %s seconds.. (see configuration)', this.simulateSlowRequests / 1000);
            setTimeout(_.bind(function () {
                this._invokeRequests(requests, true);
            }, this), this.simulateSlowRequests);
            return;
        }

        if (!_.isArray(requests)) {
            requests = [requests];
        }

        Jii.app.logger.info('Send rpc requests with methods `%s`.', _.pluck(requests, 'method').join(', '));

        var data = [];
        // Prepare our request object
        for (var i = 0; i < requests.length; i++) {
            data.push(this._generateRequestObject(requests[i]));
        }

        if (Jii.isNode) {
            // In node js used request module - https://github.com/mikeal/request
            var request = require('request');
            request({
                method: 'POST',
                uri: this.apiUrl + '?t=' + new Date().getTime(),
                json: data
            }, _.bind(function(err, response, body) {
                this._onRequestComplete(requests, body);
            }, this));
        } else {
            // In browser - jQuery.ajax()
            jQuery.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                url: this.apiUrl + '?t=' + new Date().getTime(),
                data: JSON.stringify(data),
                cache: false,
                processData: false,
                success: _.bind(function (json) {
                    this._onRequestComplete(requests, json);
                }, this),
                error: _.bind(function () {
                    this._onRequestComplete(requests);
                }, this)
            });
        }
    },

    /**
     * Callback for all requests
     * @param {array} requests
     * @param {*} [json]
     * @private
     */
    _onRequestComplete: function(requests, json) {
        var responses = this._parseResponse(json);

        this.trigger('request');

        // Check global request error, if have wrong response format
        if (responses.error) {
            this.trigger('error', responses.error);
            _.each(requests, function (request) {
                request.deferred.reject(responses.error);
            });
            return;
        }

        // Each responses
        _.each(responses, _.bind(function (response) {
            // Search request by response id
            var index = _.indexOf(_.pluck(requests, 'id'), response.id);
            if (index === -1) {
                throw new Jii.exceptions.ApplicationException('Not find request for response with id `' + response.id + '`');
            }

            // Get request object
            var request = requests[index];

            // Check local request error
            if (response.error) {
                this.trigger('error', responses.error);
                Jii.app.logger.error('RPC JSON response error: ', response.error);
                request.deferred.reject(response.error);
            } else {
                request.deferred.resolve(response.result);
            }
        }, this));

        this.trigger('afterRequest');
    },

    /**
     * Creates an RPC suitable request object
     * @param request
     * @returns {{jsonrpc: string, method: (*|string), id: number}}
     * @private
     */
    _generateRequestObject: function (request) {
        var dataObj = {
            jsonrpc: this._version,
            method: request.method,
            id: request.id
        };
        if (!_.isEmpty(request.params)) {
            dataObj.params = request.params;
        }
        return dataObj;
    },

    /**
     * Returns a generic RPC 2.0 compatible response object
     * @param [json]
     * @returns {object}
     * @private
     */
    _parseResponse: function (json) {
        if (_.isUndefined(json)) {
            return {
                error: 'Internal server error',
                version: this._version
            };
        }

        try {
            if (typeof(json) === 'string') {
                json = JSON.parse(json);
            }

            if ((_.isArray(json) && json.length > 0 && json[0].jsonrpc !== this._version) ||
                (!_.isArray(json) && json.jsonrpc !== this._version)) {
                throw new Jii.exceptions.ApplicationException('Version error');
            }

            return json;
        }
        catch (e) {
            Jii.app.logger.error('RPC JSON parsing error: `%s`. Body: ', e.toString(), json);
            return {
                error: 'Internal server error: ' + e,
                version: this._version
            };
        }
    }
});

