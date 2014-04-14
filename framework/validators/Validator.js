/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.validators.Validator
 * @extends Jii.base.Object
 */
Joints.defineClass('Jii.validators.Validator', Jii.base.Object, {

    attributes: [],
    message: null,
    on: [],
    except: [],
    skipOnError: true,
    skipOnEmpty: true,
    deferred: null,

    init: function() {

    },

    /**
     * @abstract
     * @param object
     * @param attribute
     */
    validateAttribute: function (object, attribute) {
    },

    validateValue: function() {
        throw new Jii.exceptions.ApplicationException('Not found implementation for method `validateValue()`.');
    },

    validate: function(object, attributes) {
        attributes = _.isArray(attributes) ?
            _.intersection(this.attributes, attributes) :
            this.attributes;

        var deferreds = [];

        _.each(attributes, _.bind(function(attribute) {
            if (this.skipOnError && object.hasErrors(attribute)) {
                return;
            }

            if (this.skipOnEmpty && this.isEmpty(object.get(attribute))) {
                return;
            }

            this.validateAttribute(object, attribute);
        }, this));

        return Joints.when.apply(this, deferreds);
    },

    isActive: function(scenario) {
        return _.indexOf(this.except, scenario) === -1 &&
            (this.on.length === 0 || _.indexOf(this.on, scenario) !== -1);
    },

    addError: function(object, attribute, message, params) {
        params = params || {};
        params.attribute = object.getAttributeLabel(attribute);
        params.value = object.get(attribute);

        // @todo
        //message = Jii.t('jii', message);
        _.each(params, function(value, key) {
            message = message.replace('{' + key + '}', value);
        });

        object.addError(attribute, message);
        Jii.app.logger.error('Validation error in model `%s`:', object.debugClassName, message);
    },

    isEmpty: function(value, isTrim) {
        return value === null ||
            value === '' ||
            (isTrim && _.isString(value) && value.replace(/^\s+|\s+$/g, '') === '') ||
            (_.isArray(value) && value.length === 0);
    }


}, {

    defaultValidators: {

        'boolean': 'Jii.validators.BooleanValidator',
        'compare': 'Jii.validators.CompareValidator',
        'date': 'Jii.validators.DateValidator',
        'default': 'Jii.validators.DefaultValueValidator',
        'double': 'Jii.validators.NumberValidator',
        'email': 'Jii.validators.EmailValidator',
        //'exist': 'Jii.validators.ExistValidator',
        //'file': 'Jii.validators.FileValidator',
        'filter': 'Jii.validators.FilterValidator',
        //'image': 'Jii.validators.ImageValidator',
        'in': 'Jii.validators.RangeValidator',
        'integer': {
            'className': 'Jii.validators.NumberValidator',
            'integerOnly': true
        },
        'match': 'Jii.validators.RegularExpressionValidator',
        'number': 'Jii.validators.NumberValidator',
        'required': 'Jii.validators.RequiredValidator',
        'safe': 'Jii.validators.SafeValidator',
        'string': 'Jii.validators.StringValidator',
        //'unique': 'Jii.validators.UniqueValidator',
        'url': 'Jii.validators.UrlValidator'
    },

    create: function (type, object, attributes, params) {
        params = params || {};
        params.attributes = attributes;

        if (_.isFunction(object[type])) {
            params.className = 'Jii.validators.InlineValidator';
            params.method = type;
        } else {
            if (_.has(this.defaultValidators, type)) {
                type = this.defaultValidators[type];
            }

            if (_.isArray(type)) {
                _.extend(params, type);
            } else {
                params.className = type;
            }
        }

        return Jii.createObject(params);
    }
});
