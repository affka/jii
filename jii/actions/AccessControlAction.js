/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.actions.AccessControlAction
 * @extends Jii.base.action.ServerAction
 */
var self = Joints.defineClass('Jii.actions.AccessControlAction', Jii.base.action.ServerAction, {

    run: function() {
        var headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            //'Access-Control-Allow-Headers': req.headers['access-control-request-headers'],
            'Access-Control-Allow-Headers': 'x-requested-with',
            'Access-Control-Max-Age': '2592000'
        };
        this._expressResponse.writeHead(200, headers);
        this._expressResponse.end();
    }

});
