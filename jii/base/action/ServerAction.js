/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.base.action.ServerAction
 * @extends Jii.base.action.BaseAction
 */
var self = Joints.defineClass('Jii.base.action.ServerAction', Jii.base.action.BaseAction, {

    statusCode: null,
    data: null,
    cookies: null,
    headers: null,

    _expressRequest: null,
    _expressResponse: null,

    constructor: function(config) {
    },

    init: function(request, response) {
        this._expressRequest = request;
        this._expressResponse = response;

        // Set defaults
        this.statusCode = 200;
        this.cookies = {};
        this.headers = {};
        this.deferred = new Joints.Deferred();

        // @todo
        this.params = !_.isEmpty(request.query) ? request.query : request.body;

        this._super.apply(this, arguments);
    },

    run: function() {
        this.send();
    },

    /**
     * Send response to client
     * @param {*} [data]
     */
    send: function(data) {
        if (!_.isUndefined(data)) {
            this.data = data;
        }
        this.deferred.resolve();
    },

    /**
     * Set http status code
     * @param {number} statusCode
     */
    setStatusCode: function(statusCode) {
        this.statusCode = statusCode;
    },

    /**
     * Add cookie param
     * @param {string} key
     * @param {string} value Set null for remove cookie
     * @param {object} params
     */
    setCookie: function(key, value, params) {
        this.cookies[key] = {
            value: value,
            params: params || {}
        };
    },

    /**
     * Add header to response
     * @param {string|object} key
     * @param {string} [value]
     */
    setHeader: function(key, value) {
        if (!_.isUndefined(value) && _.isString(key)) {
            this.headers[key] = value;
        } else if (_.isObject(key)) {
            this.headers = _.extend(this.headers, key);
        } else {
            throw new Jii.exceptions.ApplicationException('Wrong method ServerAction.setHeader() signature format');
        }
    }

});
