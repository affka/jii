/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.redis.CollectionSchema
     * @extends Jii.data.Schema
     */
    var self = Joints.defineClass('Jii.data.redis.CollectionSchema', Jii.data.Schema, {

        format: null,
        key: null,
        scoreAttribute: null,

        getFormat: function() {
            return this.format;
        },

        getKey: function(attributes) {
            var key = this.key;

            // Parse key
            if (_.isObject(attributes)) {
                _.each(attributes, function(value, name) {
                    key = key.replace('{' + name + '}', value);
                });
            }

            return key;
        },

        isSupportedVia: function() {
            return this.getFormat() === self.FORMAT_HASHES || this.getFormat() === self.FORMAT_STRING;
        }

    }, {

        FORMAT_STRING: 'string',
        FORMAT_HASHES: 'hashes',
        FORMAT_LISTS: 'lists',
        FORMAT_SETS: 'sets',
        FORMAT_SORTED_SETS: 'sorted_sets'

    });

})();