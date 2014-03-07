/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.BaseRequest
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.controller.BaseRequest', Jii.base.Object, {

    /**
     *
     * @returns {string|null}
     */
    getMethod: function() {
        return null;
    },

    /**
     * Resolves the current request into a route and the associated parameters.
     * @return array the first element is the route, and the second is the associated parameters.
     */
    resolve: function() {
    },

    getPathInfo: function() {
    },

    getHostInfo: function() {
    }

});
