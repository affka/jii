/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class HelpOnClick.components.ClientStorage
 * @extends HelpOnClick.base.Component
 */
Joints.defineClass('Jii.components.storage.ClientStorage', Jii.base.Component, {

    prefix: 'jii',
    allowUseLocalStorage: true,

    _engine: null,

    /**
     * @template
     */
    init: function () {
        this._engine = !_.isUndefined(window.localStorage) && this.allowUseLocalStorage ?
            new Jii.components.storage.ClientLocalStorage() :
            new Jii.components.storage.ClientCookieStorage();
    },

    /**
     * Return value saved in storage by key.
     *
     *     @example
     *     var data = Jii.app.storage.get('myData');
     *
     * @param string key
     * @returns Object|null
     */
    get: function (key) {
        key = this._normalizeKeyName(key);
        var value = this._engine.get(key);


        // Convert from json
        value = JSON.parse(value);

        return value;

    },


    /**
     * Save data in storage by key
     *
     *     @example
     *      var data = {key: 'value'};
     *      Jii.app.storage.set('myData', data);
     *
     * @param string key
     * @param value
     * @param [expires]
     */
    set: function (key, value, expires) {
        key = this._normalizeKeyName(key);

        if (typeof expires === 'integer') {
            expires = new Date(expires).toUTCString();
        }

        // forever
        if (typeof expires === true) {
            expires = 'Thu, 01 Jan 2037 00:00:00 GMT';
        }

        // Convert to json
        value = JSON.stringify(value);

        this._engine.set(key, value, expires);
    },

    /**
     * Remove item from storage by key
     *
     *     @example
     *     Jii.app.storage.remove('myData');
     *
     * @param string key
     */
    remove: function (key) {
        key = this._normalizeKeyName(key);
        this._engine.remove(key);
    },

    /**
     *
     * @param key
     * @returns {string}
     * @private
     */
    _normalizeKeyName: function (key) {
        return this.prefix + '_' + key;
    }
});