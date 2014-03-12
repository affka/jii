/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * HeaderCollection is used by [[Jii.controller.BaseResponse]] to maintain the currently registered HTTP headers.
 *
 * @class Jii.controller.HeaderCollection
 * @extends Jii.base.Object
 */
var self = Joints.defineClass('Jii.controller.HeaderCollection', Jii.base.Object, {

    _headers: null,

    init: function() {
        this._headers = {};
    },

    /**
     * Returns the named header(s).
     * @param {string} name the name of the header to return
     * @param {*} [defaultValue] the value to return in case the named header does not exist
     * @param {boolean} [isFirst] whether to only return the first header of the specified name.
     * If false, all headers of the specified name will be returned.
     * @return [string|array] the named header(s). If `first` is true, a string will be returned;
     * If `first` is false, an array will be returned.
     */
    get: function(name, defaultValue, isFirst) {
        defaultValue = defaultValue || null;
        if (_.isUndefined(isFirst)) {
            isFirst = true;
        }

        name = name.toLowerCase();
        if (_.has(this._headers, name)) {
            return isFirst ? _.first(this._headers[name]) : this._headers[name];
        }

        return defaultValue;
    },

    /**
     * Adds a new header.
     * If there is already a header with the same name, it will be replaced.
     * @param {string} name the name of the header
     * @param {string} [value] the value of the header
     * @return {static} the collection object itself
     */
    set: function(name, value) {
        value = value || '';

        name = name.toLowerCase();
        this._headers[name] = _.isArray(value) ? value : [value];

        return this;
    },

    /**
     * Adds a new header.
     * If there is already a header with the same name, the new one will
     * be appended to it instead of replacing it.
     * @param {string} name the name of the header
     * @param {string} value the value of the header
     * @return {static} the collection object itself
     */
    add: function(name, value) {
        name = name.toLowerCase();
        if (_.isArray(this._headers[name])) {
            this._headers[name] = this._headers[name].concat(value);
        } else {
            this.set(name, value);
        }

        return this;
    },

    /**
     * Sets a new header only if it does not exist yet.
     * If there is already a header with the same name, the new one will be ignored.
     * @param {string} name the name of the header
     * @param {string} [value] the value of the header
     * @return {static} the collection object itself
     */
    setDefault: function(name, value) {
        value = value || '';

        name = name.toLowerCase();
        if (!this.has(name)) {
            this.set(name, value);
        }

        return this;
    },

    /**
     * Returns a value indicating whether the named header exists.
     * @param {string} name the name of the header
     * @return {boolean} whether the named header exists
     */
    has: function(name) {
        name = name.toLowerCase();
        return _.has(this._headers, name) && this._headers[name].length > 0;
    },

    /**
     * Removes a header.
     * @param {string} name the name of the header to be removed.
     * @return {string|null} the value of the removed header. Null is returned if the header does not exist.
     */
    remove: function(name) {
        name = name.toLowerCase();
        if (_.has(this._headers, name)) {
            var value = this._headers[name];
            delete this._headers[name];

            return value;
        }
        return null;
    },

    /**
     * Removes all headers.
     */
    removeAll: function() {
        this._headers = {};
    },

    /**
     * Returns the collection as a key-value object.
     * @return {object}
     */
    toObject: function() {
        var headers = {};
        _.each(this._headers, _.bind(function(value, key) {
            headers[key] = _.first(value);
        }, this));
        return headers;
    }

});
