/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {

    /**
     * @class Jii.controller.clientRouter.HashClientRouter
     * @extends Jii.controller.clientRouter.BaseClientRouter
     */
    var self = Joints.defineClass('Jii.controller.clientRouter.HashClientRouter', Jii.controller.clientRouter.BaseClientRouter, {

        start: function () {
            if (window.addEventListener) {
                window.addEventListener("hashchange", this._bindRouteFunction, false);
            } else if (window.attachEvent) {
                window.attachEvent("onhashchange", this._bindRouteFunction);
            }
        },

        stop: function () {
            if (window.addEventListener) {
                window.addEventListener("hashchange", this._bindRouteFunction, false);
            } else if (window.attachEvent) {
                window.detachEvent("onhashchange", this._bindRouteFunction);
            }
        },

        isSupportPushState: function () {
            return window.history && window.history.pushState;
        },

        getHash: function () {
            var match = window.location.href.match(/#(.*)$/);
            return match && match[1] ? match[1] : '';
        },

        _onRoute: function (event) {
            console.log(66, event);
        }

    }, {

        MODE_PUSH_STATE: 'push_state',
        MODE_HASH: 'hash'

    });

})();