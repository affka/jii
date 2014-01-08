/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.Query
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.data.Query', Jii.base.Object, {

        modelClass: null,

        _asObject: false,

        _with: null,

        _via: null,

        _multiple: false,

        constructor: function(params) {
            _.extend(this, params);
        },

        /**
         * @param {Object} [connection]
         */
        createCommand: function(connection) {
        },

        /**
         * @param {Object} [connection]
         */
        one: function(connection) {
        },

        /**
         * @param {Object} [connection]
         */
        all: function(connection) {
        },

        /**
         * @param {String|Integer} pk
         */
        findByPk: function(pk) {
        },

        via: function(query) {
            // @todo
            this._via = query;
            return this;
        },

        /**
         * Examples:
         * // find customers together with their orders and country
         * Customer.find().with('orders', 'country').all();
         * // find customers together with their orders and the orders' shipping address
         * Customer.find().with('orders.address').all();
         * // find customers together with their country and orders of status 1
         * Customer.find().with({
         *     orders: function(query) {
	     *         query.limit = 1;
	     *     },
         *     country,
         * }).all();
         * @returns {Query}
         */
        with: function() {
            var relationNames = _.values(arguments);

            if (relationNames.length === 1) {
                if (_.isString(relationNames[0])) {
                    relationNames = relationNames[0].split(',');
                } else if (_.isArray(relationNames[0]) || _.isObject(relationNames[0])) {
                    relationNames = relationNames[0];
                }
            }

            if (this._with === null) {
                this._with = {};
            }

            _.each(relationNames, _.bind(function(value, key) {
                var name = _.isString(value) ? value : key;
                name = name.replace(/^\s+|\s+$/g, '');

                var childName = null;
                var dotIndex = name.indexOf('.');
                if (dotIndex !== -1) {
                    childName = name.substr(dotIndex + 1);
                    name = name.substr(0, dotIndex);
                }

                if (!this._with[name]) {
                    this._with[name] = {
                        callback: null,
                        child: []
                    };
                }

                if (_.isFunction(value)) {
                    this._with[name].callback = value;
                };

                if (childName !== null && _.indexOf(this._with[name].child, childName) === -1) {
                    this._with[name].child.push(childName);
                }
            }, this));

            return this;
        },

        // @todo
        hasOne: function() {
            this._multiple = false;
            return this;
        },

        // @todo
        hasMany: function() {
            this._multiple = true;
            return this;
        },

        asObject: function() {
            this._asObject = true;
            return this;
        }

    });

})();