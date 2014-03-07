/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.httpServer.Request
 * @extends Jii.controller.BaseRequest
 */
var self = Joints.defineClass('Jii.controller.httpServer.Request', Jii.controller.BaseRequest, {

    _httpMessage: null,

    /**
     * Resolves the current request into a route and the associated parameters.
     * @return {array} the first element is the route, and the second is the associated parameters.
     * @throws {Jii.exceptions.InvalidRouteException} if the request cannot be resolved.
     */
    resolve: function() {
        var result = Jii.app.getUrlManager().parseRequest(this);
        if (result !== false) {
            /*list ($route, $params) = $result;
            $_GET = array_merge($_GET, $params);
            return [$route, $_GET];*/
        }

        throw new Jii.exceptions.InvalidRouteException(Jii.t('jii', 'Page not found.'));
    },

    /**
     * Returns the method of the current request (e.g. GET, POST, HEAD, PUT, PATCH, DELETE).
     * @return {string}
     */
    getMethod: function() {
        return this._httpMessage.method;
    },

    /**
     * Returns whether this is a GET request.
     * @return {boolean}
     */
    isGet: function() {
        return this.getMethod() === 'GET';
    },

    /**
     * Returns whether this is a OPTIONS request.
     * @return {boolean}
     */
    isOptions: function() {
        return this.getMethod() === 'OPTIONS';
    },

    /**
     * Returns whether this is a HEAD request.
     * @return {boolean}
     */
    isHead: function() {
        return this.getMethod() === 'HEAD';
    },

    /**
     * Returns whether this is a POST request.
     * @return {boolean}
     */
    isPost: function() {
        return this.getMethod() === 'POST';
    },

    /**
     * Returns whether this is a DELETE request.
     * @return {boolean}
     */
    isDelete: function() {
        return this.getMethod() === 'DELETE';
    },

    /**
     * Returns whether this is a PUT request.
     * @return {boolean}
     */
    isPut: function() {
        return this.getMethod() === 'PUT';
    },

    /**
     * Returns whether this is a PATCH request.
     * @return {boolean}
     */
    isPatch: function() {
        return this.getMethod() === 'PATCH';
    },

    /**
     * Returns whether this is an AJAX (XMLHttpRequest) request.
     * @return boolean whether this is an AJAX (XMLHttpRequest) request.
     */
    isAjax: function() {
        var xhr = this._httpMessage.headers['X-Requested-With'] || '';
        return xhr.toLowerCase() === 'xmlhttprequest';
    },

    /**
     * Returns whether this is an Adobe Flash or Flex request.
     * @return boolean whether this is an Adobe Flash or Adobe Flex request.
     */
    isFlash: function() {
        var userAgent = this._httpMessage.headers['user-agent'] || '';
        return userAgent && (userAgent.indexOf('Shockwave') !== -1 ||userAgent.indexOf('Flash') !== -1);
    },

    _restParams: null,

    /**
     * Returns the request parameters for the RESTful request.
     * @return {array} The RESTful request parameters
     * @see getMethod()
     */
    getRestParams: function() {
        if (this._restParams === null) {
            this._restParams = []; // @todo
        }
        return this._restParams;
    },

    /**
     * Sets the RESTful parameters.
     * @param {array} values The RESTful parameters (name-value pairs)
     */
    setRestParams: function(values) {
        this._restParams = values;
    },

    _rawBody: null,

    /**
     * Returns the raw HTTP request body.
     * @return {string} The request body
     */
    getRawBody: function() {
        if (this._rawBody === null) {
            this._rawBody = []; // @todo
        }
        return this._rawBody;
    },

    /**
     * Returns the named RESTful parameter value.
     * @param {string} name The parameter name
     * @param {*} defaultValue The default parameter value if the parameter does not exist.
     * @return {*}
     */
    getRestParam: function(name, defaultValue) {
        var params = this.getRestParams();
        return !_.isUndefined(params[name]) ? params[name] : defaultValue || null;
    },

    /**
     * Returns the named GET parameter value.
     * If the GET parameter does not exist, the second parameter to this method will be returned.
     * @param {string} name the GET parameter name. If not specified, whole all get params is returned.
     * @param {*} defaultValue the default parameter value if the GET parameter does not exist.
     * @return {*} the GET parameter value
     * @see getPost()
     */
    get: function(name, defaultValue) {
        if (!name) {
            return []; // @todo GET
        }
        return ''; // @todo by GET
    },

    /**
     * Returns the named POST parameter value.
     * If the POST parameter does not exist, the second parameter to this method will be returned.
     * @param {string} name The POST parameter name. If not specified, whole all post params is returned.
     * @param {*} defaultValue The default parameter value if the POST parameter does not exist.
     * @return {*} The POST parameter value
     * @see get()
     */
    getPost: function(name, defaultValue) {
        // @todo
    },

    /**
     * Returns the named DELETE parameter value.
     * @param {string} name The DELETE parameter name. If not specified, an array of DELETE parameters is returned.
     * @param {*} defaultValue The default parameter value if the DELETE parameter does not exist.
     * @return {*} The DELETE parameter value
     */
    getDelete: function(name, defaultValue) {
        // @todo
    },

    /**
     * Returns the named PUT parameter value.
     * @param {string} name The PUT parameter name. If not specified, an array of PUT parameters is returned.
     * @param {*} defaultValue The default parameter value if the PUT parameter does not exist.
     * @return {*} The PUT parameter value
     */
    getPut: function(name, defaultValue) {
        // @todo
    },

    /**
     * Returns the named PATCH parameter value.
     * @param {string} name The PATCH parameter name. If not specified, an array of PATCH parameters is returned.
     * @param {*} defaultValue The default parameter value if the PATCH parameter does not exist.
     * @return {*} The PATCH parameter value
     */
    getPatch: function(name, defaultValue) {
        // @todo
    },

    _hostInfo: null,

    /**
     * Returns the schema and host part of the current request URL.
     * The returned URL does not have an ending slash.
     * By default this is determined based on the user request information.
     * You may explicitly specify it by setting the setHostInfo().
     * @return {string} Schema and hostname part (with port number if needed) of the request URL
     * @see setHostInfo()
     */
    getHostInfo: function() {
        if (this._hostInfo === null) {
            this._hostInfo = ''; // @todo
        }
        return this._hostInfo;
    },

    /**
     * Sets the schema and host part of the application URL.
     * This setter is provided in case the schema and hostname cannot be determined
     * on certain Web servers.
     * @param {string} value The schema and host part of the application URL. The trailing slashes will be removed.
     */
    setHostInfo: function(value) {
        return this._hostInfo = _.rtrim(value, '/');
    },

    _baseUrl: null,

    /**
     * Returns the relative URL for the application.
     * This is similar to [[scriptUrl]] except that it does not include the script file name,
     * and the ending slashes are removed.
     * @return {string} The relative URL for the application
     * @see setScriptUrl()
     */
    getBaseUrl: function() {
        if (this._baseUrl === null) {
            this._baseUrl = ''; // @todo
        }
        return this._baseUrl;
    },

    /**
     * Sets the relative URL for the application.
     * By default the URL is determined based on the entry script URL.
     * This setter is provided in case you want to change this behavior.
     * @param {string} value The relative URL for the application
     */
    setBaseUrl: function(value) {
        this._baseUrl = value;
    },

    _scriptUrl: null,

    /**
     * Returns the relative URL of the entry script.
     * @return {string} The relative URL of the entry script.
     */
    getScriptUrl: function() {
        if (this._scriptUrl === null) {
            this._scriptUrl = ''; // @todo
        }
        return this._scriptUrl;
    },

    /**
     * Sets the relative URL for the application entry script.
     * This setter is provided in case the entry script URL cannot be determined
     * on certain Web servers.
     * @param {string} value The relative URL for the application entry script.
     */
    setScriptUrl: function(value) {
        this._scriptUrl = '/' + _.trim(value, '/');
    },

    _pathInfo: null,

    /**
     * Returns the path info of the currently requested URL.
     * A path info refers to the part that is after the entry script and before the question mark (query string).
     * The starting and ending slashes are both removed.
     * @return {string} Part of the request URL that is after the entry script and before the question mark.
     * Note, the returned path info is already URL-decoded.
     */
    getPathInfo: function() {
        if (this._pathInfo === null) {
            this._pathInfo = this._resolvePathInfo();
        }
        return this._pathInfo;
    },

    /**
     * Sets the path info of the current request.
     * This method is mainly provided for testing purpose.
     * @param {string} value The path info of the current request
     */
    setPathInfo: function(value) {
        this._pathInfo = _.ltrim(value, '/');
    },

    /**
     * Resolves the path info part of the currently requested URL.
     * A path info refers to the part that is after the entry script and before the question mark (query string).
     * The starting slashes are both removed (ending slashes will be kept).
     * @return {string} Part of the request URL that is after the entry script and before the question mark.
     * Note, the returned path info is decoded.
     */
    _resolvePathInfo: function() {

    },

    /**
     * Returns the currently requested absolute URL.
     * This is a shortcut to the concatenation of [[hostInfo]] and [[url]].
     * @return {string} The currently requested absolute URL.
     */
    getAbsoluteUrl: function() {
        return this.getHostInfo() + this.getUrl();
    },

    _url: null,

    /**
     * Returns the currently requested relative URL.
     * This refers to the portion of the URL that is after the [[hostInfo]] part.
     * It includes the [[queryString]] part if any.
     * @return {string} The currently requested relative URL. Note that the URI returned is URL-encoded.
     */
    getUrl: function() {
        if (this._url === null) {
            this._url = this._resolveRequestUri();
        }
        return this._url;
    },

    /**
     * Sets the currently requested relative URL.
     * The URI must refer to the portion that is after [[hostInfo]].
     * Note that the URI should be URL-encoded.
     * @param {string} value The request URI to be set
     */
    setUrl: function(value) {
        this._url = _.ltrim(value, '/');
    },

    /**
     * Resolves the request URI portion for the currently requested URL.
     * This refers to the portion that is after the [[hostInfo]] part. It includes the [[queryString]] part if any.
     * @return {string|boolean} the request URI portion for the currently requested URL.
     * Note that the URI returned is URL-encoded.
     */
    _resolveRequestUri: function() {

    },

    /**
     * Returns part of the request URL that is after the question mark.
     * @return {string} Part of the request URL that is after the question mark
     */
    getQueryString: function() {
        // @todo
    },

    /**
     * Return if the request is sent via secure channel (https).
     * @return {boolean} If the request is sent via secure channel (https)
     */
    isSecureConnection: function() {
        // @todo
    },

    /**
     * Returns the server name.
     * @return {string} Server name
     */
    getServerName: function() {
        // @todo
    },

    /**
     * Returns the server port number.
     * @return {number} Server port number
     */
    getServerPort: function() {
        // @todo
    },

    /**
     * Returns the URL referrer, null if not present
     * @return string URL referrer, null if not present
     */
    getReferrer: function() {
        // @todo
    },

    /**
     * Returns the user agent, null if not present.
     * @return string user agent, null if not present
     */
    getUserAgent: function() {
        // @todo
    },

    /**
     * Returns the user IP address.
     * @return string user IP address
     */
    getUserIP: function() {
        // @todo
    },

    /**
     * Returns the user host name, null if it cannot be determined.
     * @return string user host name, null if cannot be determined
     */
    getUserHost: function() {
        // @todo
    },

    /**
     * Returns user browser accept types, null if not present.
     * @return string user browser accept types, null if not present
     */
    getAcceptTypes: function() {
        // @todo
    },

    _port: null,

    /**
     * Returns the port to use for insecure requests.
     * Defaults to 80, or the port specified by the server if the current
     * request is insecure.
     * @return {number} Port number for insecure requests.
     * @see setPort()
     */
    getPort: function() {
        if (this._port === null) {
            this._port = 80; // @todo
        }
        return this._port;
    },

    /**
     * Sets the port to use for insecure requests.
     * This setter is provided in case a custom port is necessary for certain
     * server configurations.
     * @param {number} value Port number.
     */
    setPort: function(value) {
        if (value != this._port) {
            this._port = parseInt(value);
            this._hostInfo = null;
        }
    },

    _securePort: null,

    /**
     * Returns the port to use for secure requests.
     * Defaults to 443, or the port specified by the server if the current
     * request is secure.
     * @return {number} Port number for secure requests.
     * @see setSecurePort()
     */
    getSecurePort: function() {
        if (this._securePort === null) {
            this._securePort = 0; // @todo
        }
        return this._securePort;
    },

    /**
     * Sets the port to use for secure requests.
     * This setter is provided in case a custom port is necessary for certain
     * server configurations.
     * @param {number} value port number.
     */
    setSecurePort: function(value) {
        if (value != this._port) {
            this._securePort = parseInt(value);
            this._hostInfo = null;
        }
    },

    _contentTypes: null,

    /**
     * Returns the content types accepted by the end user.
     * This is determined by the `Accept` HTTP header.
     * @return {array} The content types ordered by the preference level. The first element
     * represents the most preferred content type.
     */
    getAcceptedContentTypes: function() {
        if (this._contentTypes === null) {
            this._contentTypes = []; // @todo
        }
        return this._contentTypes;
    },

    /**
     * @param {array} value The content types that are accepted by the end user. They should
     * be ordered by the preference level.
     */
    setAcceptedContentTypes: function(value) {
        this._contentTypes = value;
    },

    _languages: null,

    /**
     * Returns the languages accepted by the end user.
     * This is determined by the `Accept-Language` HTTP header.
     * @return {array} The languages ordered by the preference level. The first element
     * represents the most preferred language.
     */
    getAcceptedLanguages: function() {
        if (this._languages === null) {
            if (this._httpMessage.accept) {
                this._languages = this._parseAcceptHeader(this._httpMessage.accept);
            }
            this._languages = [];
        }
        return this._languages;
    },

    /**
     * @param {array} value The languages that are accepted by the end user. They should
     * be ordered by the preference level.
     */
    setAcceptedLanguages: function(value) {
        this._languages = value;
    },

    /**
     * Parses the given `Accept` (or `Accept-Language`) header.
     * This method will return the accepted values ordered by their preference level.
     * @param {string} header The header to be parsed
     * @return {array} The accept values ordered by their preference level.
     */
    _parseAcceptHeader: function(header) {
        // @todo
    },

    /**
     * Returns the user-preferred language that should be used by this application.
     * The language resolution is based on the user preferred languages and the languages
     * supported by the application. The method will try to find the best match.
     * @param {object} languages A list of the languages supported by the application.
     * If empty, this method will return the first language returned by [[getAcceptedLanguages()]].
     * @return {string} The language that the application should use. Null is returned if both [[getAcceptedLanguages()]]
     * and `languages` are empty.
     */
    getPreferredLanguage: function(languages) {
        var acceptedLanguages = this.getAcceptedLanguages();
        var finedLanguage = null;

        if (_.isEmpty(languages)) {
            return acceptedLanguages.length > 0 ? acceptedLanguages[0] : null;
        }

        _.each(acceptedLanguages, function(acceptedLanguage) {
            acceptedLanguage = acceptedLanguage.replace('_', '-').toLowerCase();
            _.each(languages, function(language) {
                language = language.replace('_', '-').toLowerCase();

                // en-us==en-us, en==en-us, en-us==en
                if (language === acceptedLanguage || acceptedLanguage.indexOf(language + '-') === 0 || language.indexOf(acceptedLanguage + '-') === 0) {
                    finedLanguage = language;
                    return false;
                }
            });
        });

        return finedLanguage || _.values(languages)[0];
    },

    _cookies: null,

    getCookies: function() {

        if (this._cookies === null) {
            this._cookies = this._loadCookies();
        }
        return this._cookies;
    },

    _loadCookies: function() {
        // @todo
    }


});
