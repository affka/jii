/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.actions.JsonRpcAction
 * @extends Jii.base.action.ServerAction
 */
var self = Joints.defineClass('Jii.actions.JsonRpcAction', Jii.base.action.ServerAction, {

    _id: null,

    run: function() {
        this._id = this.params.id || 1;
        this.setHeader('Content-Type', 'application/json');

        // Check json rpc version
        if (this.params.jsonrpc !== '2.0') {
            this._onError(400, {
                code: -32600,
                message: 'Bad Request. JSON RPC version is invalid or missing',
                data: null
            });
            return;
        }

        // Generate route path as api path + method name with namespace
        var path = this._expressRequest.route.path;
        path = path.replace(/^\/(.+)/, '$1');
        path = path + '/' + this.params.method;
        var route = this.owner.routes[path];

        // Check path exists
        if (!route) {
            this._onError(404, {
                code: -32601,
                message: 'Method not found : ' + this.params.method
            });
            return;
        }

        this.owner.runAction(route, this._expressRequest, this._expressResponse).always(this._onRunAction.bind(this));
    },

    _onRunAction: function(action) {
        try {
            // Send response
            action.deferred.done(function() {
                this._sendSuccess(action);
            }.bind(this));

            action.deferred.fail(function() {
                this._onError(action.statusCode, {
                    code: -32603,
                    message: 'Failed',
                    data: null
                });
            }.bind(this));
        } catch (exception) {
            this._onError(500, {
                code: -32603,
                message: 'Exception at method call',
                data: exception
            });
        }
    },

    /**
     *
     * @param {Jii.base.action.ServerAction} action
     * @private
     */
    _sendSuccess: function(action) {
        this.setStatusCode(action.statusCode);
        this.setHeader(action.headers);
        this.send({
            jsonrpc: '2.0',
            result: action.data,
            error : null,
            id: this._id
        });
    },

    /**
     *
     * @param {number} statusCode
     * @param {object} errorObject
     * @private
     */
    _onError: function(statusCode, errorObject) {
        this.setStatusCode(statusCode);
        this.send({
            jsonrpc: '2.0',
            error: errorObject,
            id: this._id
        });
    }

});
