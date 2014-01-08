/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.validators.DefaultValueValidator
 * @extends Jii.validators.Validator
 */
Joints.defineClass('Jii.validators.DefaultValueValidator', Jii.validators.Validator, {

    value: null,

    skipOnEmpty: false,

    init: function() {
        this._super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute: function(object, attribute) {
        if (this.isEmpty(object.get(attribute))) {
            object.set(attribute, this.value);
        }

    }

});
