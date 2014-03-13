/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.validators.FilterValidator
 * @extends Jii.validators.Validator
 */
Joints.defineClass('Jii.validators.FilterValidator', Jii.validators.Validator, {

    filter: null,

    skipOnEmpty: false,

    init: function() {
        this._super();
        if (this.filter === null) {
            throw new Jii.exceptions.ApplicationException('The `filter` property must be set.');
        }
    },

    validateAttribute: function(object, attribute) {
        object.set(attribute, this.filter.call(object, object.get(attribute)));
    }

});
