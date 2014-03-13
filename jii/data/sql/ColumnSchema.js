/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.sql.ColumnSchema
     * @extends Jii.data.ColumnSchema
     */
    var self = Joints.defineClass('Jii.data.sql.ColumnSchema', Jii.data.ColumnSchema, {

        name: null,
        allowNull: null,
        type: null,
        phpType: null,
        dbType: null,
        defaultValue: null,
        enumValues: null,
        size: null,
        precision: null,
        scale: null,
        isPrimaryKey: null,
        autoIncrement: false,
        unsigned: null,
        comment: null,

        constructor: function(config) {
            _.extend(this, config);

            this._super.apply(this, arguments);
        },

        typecast: function (value) {
            // @todo
        }

    });

})();