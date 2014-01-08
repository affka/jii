/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.request.proxy.JsonRpcProxy
 * @extends Jii.components.request.proxy.BaseProxy
 */
var self = Joints.defineClass('Jii.components.request.proxy.JsonRpcProxy', Jii.components.request.proxy.BaseProxy, {

    /**
     * @param {string} methodType
     * @param {object} params
     * @returns {Joints.Deferred}
     * @private
     */
    _send: function (methodType, params) {
        // Get request method name and check exists it
        var method = this.api[methodType];
        if (!method) {
            throw new Jii.exceptions.ApplicationException('Not find method name for method type `' + methodType + '`');
        }

        // Send request to server
        return this.request.send(method, {
            params: params
        });
    }

});

