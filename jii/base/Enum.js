/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * Abastract class for javascript enums
     * @class Jii.base.Enum
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.base.Enum', Jii.base.Object, {}, {

        /**
         * Overwrite this method to set list items
         */
        getList: function() {
        },

        /**
         * Get label by id
         * @param {string} id
         * @returns {string|null}
         */
        getLabel: function(id) {
            return self.getLabels(id);
        },

        /**
         * Get labels list by list id
         * @param {array} ids
         * @param {string} separator
         * @returns {string|null}
         */
        getLabels: function(ids, separator) {
            if (!_.isArray(ids)) {
                ids = [ids];
            }
            if (!separator) {
                separator = ', ';
            }

            var fined = [];
            var labels = self.getList();

            _.each(ids, function(id) {
                if (_.has(labels, id)) {
                    fined.push(labels[id]);
                }
            });

            if (fined.length === 0) {
                return null;
            }

            return fined.join(separator);
        },

        /**
         * Get enum list
         * @returns {Array}
         */
        getKeys: function() {
            return _.keys(self.getList());
        }
    });

})();