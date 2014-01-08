/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.validators.DateValidator
 * @extends Jii.validators.Validator
 */
Joints.defineClass('Jii.validators.DateValidator', Jii.validators.Validator, {

    format: 'Y-m-d',

    timestampAttribute: null,

    init: function() {
        this._super();
        if (this.message === null) {
            this.message = Jii.t('jii', 'The format of {attribute} is invalid.');
        }
    },

    validateAttribute: function(object, attribute) {
        var value = object.get(attribute);

        if (_.isArray(value)) {
            this.addError(object, attribute, this.message);
            return;
        }

        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message);
        } else if (this.timestampAttribute !== null) {
            // @todo Parse by format
            var timestamp = Date.parse(value);
            object.set(this.timestampAttribute, Math.round(timestamp / 1000));
        }
    },

    validateValue: function(value) {
        // @todo Validate by format
        var timestamp = Date.parse(value);
        return !_.isNaN(timestamp);
    }

});
