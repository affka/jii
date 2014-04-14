/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.clientRouter.Request
 * @extends Jii.controller.BaseHttpRequest
 */
var self = Joints.defineClass('Jii.controller.clientRouter.Request', Jii.controller.BaseHttpRequest, {

    _location: null,

    constructor: function(location) {
        if (!(location instanceof Location)) {
            throw new Jii.exceptions.InvalidConfigException('Location is not instanceof class browser Location.');
        }
        this._location = _.clone(location);

        this.init();
    },

    getMethod: function() {
        return 'GET';
    },

    /**
     * Parsing query string to key-value object
     * @see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
     * @returns {object}
     * @private
     */
    _parseQueryParams: function() {
        var spaceRegexp = /\+/g;  // Regex for replacing addition symbol with a space
        var searchRegexp = /([^&=]+)=?([^&]*)/g;
        var query  = this._location.search.substring(1);
        var decode = function (s) {
            return decodeURIComponent(s.replace(spaceRegexp, " "));
        };

        var match = null;
        var urlParams = {};
        while (match = searchRegexp.exec(query)) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    },

    /**
     * Return if the request is sent via secure channel (https).
     * @return {boolean} If the request is sent via secure channel (https)
     */
    isSecureConnection: function() {
        return this._location.protocol === 'https:';
    },

    /**
     * Returns the server name.
     * @return {string} Server name
     */
    getServerName: function() {
        return this._location.hostname;
    },

    /**
     * Returns the server port number.
     * @return {number} Server port number
     */
    getServerPort: function() {
        return this._location.port || 80;
    },

    /**
     * Returns the URL referrer, null if not present
     * @return string URL referrer, null if not present
     */
    getReferrer: function() {
    },

    /**
     * Returns the user agent, null if not present.
     * @return string user agent, null if not present
     */
    getUserAgent: function() {
    },

    _parsePathInfo: function() {
        return _.ltrim(this._location.pathname, '/');
    }

});
