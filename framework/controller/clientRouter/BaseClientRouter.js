/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {

    /**
     * @class Jii.controller.clientRouter.BaseClientRouter
     * @extends Jii.base.Component
     */
    var self = Joints.defineClass('Jii.controller.clientRouter.BaseClientRouter', Jii.base.Component, {

        /**
         * @type {Jii.controller.UrlManager|string}
         */
        urlManager: 'urlManager',

        _bindRouteFunction: null,

        init: function () {
            this._bindRouteFunction = _.bind(this._onRoute, this);

            if (_.isString(this.urlManager)) {
                this.urlManager = Jii.app.getComponent(this.urlManager);
            }
        },

        start: function () {
        },

        stop: function () {
        },

        _onRoute: function (event) {
        }

    });

})();