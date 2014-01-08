/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.sql.TableSchema
     * @extends Jii.data.Schema
     */
    var self = Joints.defineClass('Jii.data.sql.TableSchema', Jii.data.Schema, {

        /**
         * @type {String}
         */
        primaryKey: null,

        /**
         * Formats:
         *  - username
         *  - username: {type: 'string', ...}
         *  @type {Object}
         */
        columns: {},

        constructor: function(config) {
            _.each(config.columns, _.bind(function(columnSchema, name) {
                if (_.isString(columnSchema)) {
                    name = columnSchema;
                    columnSchema = {};
                }

                if (!(columnSchema instanceof Jii.data.sql.ColumnSchema)) {
                    columnSchema.name = name;
                    columnSchema = new Jii.data.sql.ColumnSchema(columnSchema);
                }

                this.columns[name] = columnSchema;
            }, this));

            this._super.apply(this, arguments);
        },

        /**
         *
         * @param {String} name
         * @returns {*}
         */
        getColumn: function(name) {
            return _.has(this.columns, name) ? this.columns[name] : null;
        },

        /**
         *
         * @returns {Array}
         */
        getColumnNames: function() {
            return _.keys(this.columns);
        }

    });

})();