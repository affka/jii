/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {


    /**
     * @class Jii.controller.BaseRequest
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.controller.BaseRequest', Jii.base.Object, {

        /**
         *
         * @returns {string|null}
         */
        getMethod: function () {
            return null;
        },

        /**
         * Resolves the current request into a route and the associated parameters.
         * @return array the first element is the route, and the second is the associated parameters.
         */
        resolve: function () {
        },

        _pathInfo: null,

        /**
         * Returns the path info of the currently requested URL.
         * A path info refers to the part that is after the entry script and before the question mark (query string).
         * The starting and ending slashes are both removed.
         * @return {string} Part of the request URL that is after the entry script and before the question mark.
         * Note, the returned path info is already URL-decoded.
         */
        getPathInfo: function () {
            if (this._pathInfo === null) {
                this._pathInfo = this._parsePathInfo();
            }
            return this._pathInfo;
        },

        /**
         * Sets the path info of the current request.
         * This method is mainly provided for testing purpose.
         * @param {string} value The path info of the current request
         */
        setPathInfo: function (value) {
            this._pathInfo = _.ltrim(value, '/');
        },

        _parsePathInfo: function () {
            return '';
        },

        _hostInfo: null,

        /**
         * Returns the schema and host part of the current request URL.
         * The returned URL does not have an ending slash.
         * By default this is determined based on the user request information.
         * You may explicitly specify it by setting the setHostInfo().
         * @return {string} Schema and hostname part (with port number if needed) of the request URL
         */
        getHostInfo: function () {
            if (this._hostInfo === null) {
                this._hostInfo = this._parseHostInfo();
            }
            return this._hostInfo;
        },

        /**
         * Sets the schema and host part of the application URL.
         * This setter is provided in case the schema and hostname cannot be determined
         * on certain Web servers.
         * @param {string} value The schema and host part of the application URL. The trailing slashes will be removed.
         */
        setHostInfo: function (value) {
            return this._hostInfo = _.rtrim(value, '/');
        },

        _parseHostInfo: function () {
            return '';
        }

    });

})();