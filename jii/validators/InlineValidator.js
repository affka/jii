/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.validators.InlineValidator
 * @extends Jii.validators.Validator
 */
Joints.defineClass('Jii.validators.InlineValidator', Jii.validators.Validator, {

    method: null,

    params: null,

    init: function() {
        this._super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute: function(object, attribute) {
        var method = object[this.method];

        if (!_.isFunction(method)) {
            throw new Jii.exceptions.ApplicationException('Not find method `' + this.method + '` in model `' + object.debugClassName + '`.');
        }

        method.call(object, attribute, this.params || {});
    }

});
