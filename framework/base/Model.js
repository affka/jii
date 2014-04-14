/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.base.Model
     * @extends Joints.Events
     */
    var self = Joints.defineClass('Jii.base.Model', Joints.Events, {

        _attributes: {},
        _errors: {},
        _validators: null,
        _scenario: 'default',

        constructor: function () {
            this._attributes = _.clone(this._attributes);
            this._errors = _.clone(this._errors);

            this.init();

            this._super.apply(this, arguments);
        },

        init: function() {

        },

        /**
         * Get attribute value
         * @param {String} key
         * @returns {*}
         */
        get: function(key) {
            return !_.isUndefined(this._attributes[key]) ? this._attributes[key] : null;
        },

        /**
         * Set attribute value
         * @param {String} key
         * @param {*} value
         * @returns {Boolean} True, if model changed
         */
        set: function(key, value) {
            if (!this.hasAttribute(key)) {
                throw new Jii.exceptions.ApplicationException('Not find attribute `' + key + '`');
            }

            // Check changes
            if (_.isEqual(this._attributes[key], value)) {
                return false;
            }

            this._attributes[key] = value;
            // @todo Move to browser model
            //this.trigger('change:' + key, this, this._attributes[key]);

            return true;
        },

        /**
         * Validation rules
         * @returns {array}
         */
        rules: function () {
            return [];
        },

        /**
         * Update model attributes. This method run change
         * and change:* events, if attributes will be changes
         * @param attributes
         * @param {Boolean} [safeOnly]
         * @returns {boolean}
         */
        setAttributes: function (attributes, safeOnly) {
            if (_.isUndefined(safeOnly)) {
                safeOnly = true;
            }

            var isChanged = false;
            var attributeNames = safeOnly ? this.safeAttributes() : this.attributes();

            _.each(attributes, _.bind(function (value, key) {
                if (_.indexOf(attributeNames, key) !== -1) {
                    isChanged = this.set(key, value);
                }
            }, this));

            if (isChanged) {
                // @todo Move to browser model
                //this.trigger('change', this);
            }
            return isChanged;
        },

        /**
         * Returns attribute values.
         * @param {Array} [names]
         * @param {Array} [except]
         * @returns {{}} Attribute values (name => value).
         */
        getAttributes: function (names, except) {
            var values = {};

            if (!_.isArray(names)) {
                names = this.attributes();
            }

            _.each(names, _.bind(function(name) {
                if (!_.isArray(except) || _.indexOf(name, except) === -1) {
                    values[name] = this.get(name);
                }
            }, this));

            return values;
        },

        /**
         * Get attributes list for this model
         * @return {Array}
         */
        attributes: function() {
            return _.keys(this._attributes);
        },

        /**
         * Check attribute exists in this model
         * @param {String} name
         * @returns {boolean}
         */
        hasAttribute: function(name) {
            //return true;
            return _.indexOf(this.attributes(), name) !== -1;
        },

        /**
         * Format: attribute => label
         * @return {object}
         */
        attributeLabels: function () {
            return {};
        },

        /**
         * Get label by attribute name
         * @param {string} name
         * @returns {string}
         */
        getAttributeLabel: function (name) {
            var attributes = this.attributeLabels();
            return _.has(attributes, name) ? attributes[name] : name;
        },

        /**
         *
         * @param scenario
         */
        setScenario: function(scenario) {
            this._scenario = scenario;
        },

        /**
         *
         * @returns {string}
         */
        getScenario: function() {
            return this._scenario;
        },

        safeAttributes: function() {
            var scenario = this.getScenario();
            var scenarios = this.scenarios();

            if (!_.has(scenarios, scenario)) {
                return [];
            }

            var attributes = [];
            _.each(scenarios[scenario], function(attribute, i) {
                if (attribute.substr(0, 1) !== '!') {
                    attributes.push(attribute);
                }
            });
            return attributes;
        },

        /**
         *
         * @returns {*}
         */
        activeAttributes: function() {
            var scenario = this.getScenario();
            var scenarios = this.scenarios();

            if (!_.has(scenarios, scenario)) {
                return [];
            }

            var attributes = scenarios[scenario];
            _.each(attributes, function(attribute, i) {
                if (attribute.substr(0, 1) === '!') {
                    attributes[i] = attribute.substr(1);
                }
            });

            return attributes;
        },

        /**
         *
         * @returns {Object}
         */
        scenarios: function() {
            var scenarios = {};

            _.each(this.getValidators(), function(validator) {
                var validatorScenarios = validator.on.length > 0 ? validator.on : names;
                _.each(validatorScenarios, function(name) {
                    if (!scenarios[name]) {
                        scenarios[name] = [];
                    }

                    if (_.indexOf(validator.except, name) !== -1) {
                        return;
                    }

                    _.each(validator.attributes, function(attribute) {

                        if (_.indexOf(scenarios[name], attribute) !== -1) {
                            return;
                        }

                        scenarios[name].push(attribute);
                    });
                });
            });

            return scenarios;
        },

        /**
         *
         * @returns {Array}
         */
        createValidators: function() {
            var validators = [];
            _.each(this.rules(), _.bind(function(rule) {
                if (rule instanceof Jii.validators.Validator) {
                    validators.push(rule);
                } else if (_.isArray(rule) && rule.length >= 2) {
                    var attributes = _.isString(rule[0]) ? [rule[0]] : rule[0];
                    var params = rule[2] || {};
                    params.on = _.isString(params.on) ? [params.on] : params.on;

                    var validator = Jii.validators.Validator.create(rule[1], this, attributes, params);
                    validators.push(validator);
                } else {
                    throw new Jii.exceptions.ApplicationException('Invalid validation rule: a rule must specify both attribute names and validator type.');
                }
            }, this));
            return validators;
        },

        /**
         *
         * @returns {*}
         */
        getValidators: function() {
            if (this._validators === null) {
                this._validators = this.createValidators();
            }
            return this._validators;
        },

        /**
         *
         * @param [attribute]
         * @returns {Array}
         */
        getActiveValidators: function(attribute) {
            var validators = [];
            var scenario = this.getScenario();

            _.each(this.getValidators(), function(validator) {
                if (!validator.isActive(scenario)) {
                    return;
                }

                if (attribute && _.indexOf(validator.attributes, attribute) === -1) {
                    return;
                }

                validators.push(validator);
            });

            return validators;
        },

        /**
         * Validate model by rules, see rules() method.
         * @param {Array} [attributes]
         * @param {Boolean} [isClearErrors]
         */
        validate: function (attributes, isClearErrors) {
            if (_.isUndefined(isClearErrors)) {
                isClearErrors = true;
            }
            if (!attributes) {
                attributes = this.activeAttributes();
            }

            var scenarios = this.scenarios();
            var scenario = this.getScenario();
            if (!_.has(scenarios, scenario)) {
                throw new Jii.exceptions.ApplicationException('Unknow scenario `' + scenario + '`.');
            }

            if (isClearErrors) {
                this.clearErrors();
            }

            return this.beforeValidate().then(_.bind(function(bool) {
                    if (!bool) {
                        return false;
                    }

                    var deferreds = [];

                    _.each(this.getActiveValidators(), _.bind(function(validator) {
                        validator.validate(this, attributes);
                    }, this));

                    return Joints.when.apply(this, deferreds.length > 0 ? deferreds : [null]);
                }, this)).then(_.bind(function() {

                    return this.afterValidate();
                }, this)).then(_.bind(function() {

                    // Return result
                    return !this.hasErrors();
                }, this));
        },

        addError: function(attribute, error) {
            if (!this._errors[attribute]) {
                this._errors[attribute] = [];
            }

            this._errors[attribute].push(error);
        },

        /**
         *
         * @param [attribute]
         * @returns {*}
         */
        getErrors: function(attribute) {
            return !attribute ? this._errors : this._errors[attribute] || {};
        },

        /**
         *
         * @param [attribute]
         * @returns {*}
         */
        hasErrors: function(attribute) {
            return attribute ? _.has(this._errors, attribute) : !_.isEmpty(this._errors);
        },

        /**
         *
         * @param [attribute]
         * @returns {*}
         */
        clearErrors: function(attribute) {
            if (!attribute) {
                this._errors = {};
            } else {
                delete this._errors[attribute];
            }
        },

        beforeValidate: function() {
            return new Joints.Deferred().resolve(true);
        },

        afterValidate: function() {
            return new Joints.Deferred().resolve();
        }

    });

})();