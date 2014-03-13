/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.Schema
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.data.Schema', Jii.base.Object, {

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

        columnClassName: 'Jii.data.ColumnSchema',

        init: function() {
            var columnClass = Joints.namespace(this.columnClassName);
            var configColumns = this.columns;

            this.columns = {};
            _.each(configColumns, _.bind(function(columnSchema, name) {
                if (_.isString(columnSchema)) {
                    name = columnSchema;
                    columnSchema = {};
                }

                if (!(columnSchema instanceof columnClass)) {
                    columnSchema.name = name;
                    columnSchema = new columnClass(columnSchema);
                }

                this.columns[name] = columnSchema;
            }, this));

            // Autodetect key
            if (this.primaryKey === null) {
                if (_.has(this.columns, 'id')) {
                    this.primaryKey = 'id';
                } else if (_.has(this.columns, 'uid')) {
                    this.primaryKey = 'uid';
                }
            }

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