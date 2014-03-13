/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.sql.ActiveRecord
     * @extends Jii.data.DataModel
     */
    var self = Joints.defineClass('Jii.data.sql.ActiveRecord', Jii.data.DataModel, {


    }, {

        createQuery: function() {
            // @todo
        },

        createRelationQuery: function(config) {
            // @todo
        },

        getDb: function() {
            return Jii.app.db;
        },

        tableName: function() {
            return '';
        },

        /**
         * @return {Jii.data.Schema}
         */
        getSchema: function() {
            var schema = self.getDb().getTableSchema(self.tableName());
            if (schema !== null) {
                return schema;
            }

            throw new Jii.exceptions.ApplicationException('Table `' + self.tableName() + '` does not exists');
        }

    });

})();