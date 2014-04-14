/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {

    /**
     * @class Jii.controller.clientRouter.HtmlHistoryClientRouter
     * @extends Jii.controller.clientRouter.BaseClientRouter
     */
    var self = Joints.defineClass('Jii.controller.clientRouter.HtmlHistoryClientRouter', Jii.controller.clientRouter.BaseClientRouter, {

        start: function () {
            window.addEventListener('popstate', this._bindRouteFunction, false);
        },

        stop: function () {
            window.removeEventListener('popstate', this._bindRouteFunction);
        },

        _onRoute: function (event) {
            var request = new Jii.controller.clientRouter.Request(location);
            var result = this.urlManager.parseRequest(request);
            if (result !== false) {
                var route = result[0];
                var params = result[1];

                // Append parsed params to request
                var queryParams = request.getQueryParams();
                request.setQueryParams(_.extend(queryParams, params));

                var response = new Jii.controller.clientRouter.Response();
                Jii.app.runAction(route, request, response);
            }
        }

    }, {

        isBrowserSupported: function () {
            return window.history && window.history.pushState;
        }

    });

})();