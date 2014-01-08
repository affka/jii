/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {

    /**
     * @class Jii.components.request.proxy.BaseProxy
     * @extends Jii.base.Component
     */
    var self = Joints.defineClass('Jii.components.request.proxy.BaseProxy', Jii.base.Component, {

        /**
         * @type {Jii.components.request.JsonRpc}
         */
        request: null,

        /**
         * @type {object}
         */
        api: null,

        init: function () {
            this.api = {};
        },

        /**
         * @param {object} params
         * @returns {Joints.Deferred}
         */
        create: function (params) {
            return this._send.call(this, self.METHOD_CREATE, params);
        },

        read: function (params) {
            return this._send.call(this, self.METHOD_READ, params || {});
        },

        /**
         * @param {object} params
         * @returns {Joints.Deferred}
         */
        update: function (params) {
            return this._send.call(this, self.METHOD_UPDATE, params);
        },

        // @todo
        /*delete: function (params) {
            return this._send.call(this, self.METHOD_DELETE, params);
        },*/

        /**
         * @param {string} methodType
         * @param {object} params
         * @returns {Joints.Deferred}
         * @private
         */
        _send: function (methodType, params) {
            throw new Jii.Jii.exceptions.ApplicationException('Need implementation for method _send() in request proxy.');
        }

    }, {
        METHOD_CREATE: 'create',
        METHOD_READ: 'read',
        METHOD_UPDATE: 'update',
        METHOD_DELETE: 'delete'
    });

})();