/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.app.Application
 * @extends Jii.base.Module
 * @property {Jii.components.Db} db
 * @property {Jii.components.HttpServer} http
 * @property {Jii.components.Logger} logger
 * @property {Jii.components.Redis} redis
 * @property {Jii.components.String} string
 * @property {Jii.components.Time} time
 * @property {Jii.components.router.BaseRouter} router
 * @property {Jii.components.request.JsonRpc} rpcRequest
 * @property {Jii.components.User} user
 */
var self = Joints.defineClass('Jii.base.Application', Jii.base.Module, {

    baseUrl: null,
    debug: null,
    controllerNamespace: 'app.controllers',

    /**
     * @constructor
     */
    constructor: function(config) {
        this._super(null, null, config);
    },

    getUniqueId: function() {
        return '';
    }

});
