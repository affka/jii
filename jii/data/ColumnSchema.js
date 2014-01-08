/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.data.ColumnSchema
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.data.ColumnSchema', Jii.base.Object, {

        name: null,
        jsType: null,

        constructor: function(config) {
            _.extend(this, config);

            this._super.apply(this, arguments);
        },

        typecast: function (value) {
            // @todo
        }

    });

})();