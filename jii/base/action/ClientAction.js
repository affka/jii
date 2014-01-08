/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.base.action.ClientAction
 * @extends Jii.base.action.BaseAction
 */
var self = Joints.defineClass('Jii.base.action.ClientAction', Jii.base.action.BaseAction, {

    path: null,

    init: function(params) {
        this.path = params.path;
        this.params = params.params;
    },

    run: function() {
    },

    stop: function() {
    }

});
