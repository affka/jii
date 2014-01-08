/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {

    /**
     * Events:
     *  - submit
     *  - update
     * @class Jii.widgets.form.FormWidget
     * @extends Jii.base.Widget
     */
    var self = Joints.defineClass('Jii.widgets.form.FormWidget', Jii.base.Widget, {

        template: _.template(RIABuilder.getTemplate('lib/jii/widgets/form/templates/form.html')),
        buttonsRowTemplate: _.template(RIABuilder.getTemplate('lib/jii/widgets/form/templates/buttonsRow.html')),

        fieldsetClassName: 'Jii.widgets.form.Fieldset',
        buttonClassName: 'Jii.widgets.form.Button',

        _fieldsetsParams: null,
        _buttonsParams: null,

        /**
         * @type {Jii.components.request.proxy.BaseProxy}
         */
        proxy: null,

        /**
         * @type {Jii.widgets.form.Fieldset[]}
         */
        fieldsets: null,

        /**
         * @type {Jii.widgets.form.Button[]}
         */
        buttons: null,

        initialize: function (options) {
            options = options || {};

            // Store main fieldset here
            var mainFieldset = {
                model: options.model || null,
                title: options.title || null,
                description: options.description || null,
                elements: {}
            };

            // Parse fieldset params: title, description and elements list
            this._fieldsetsParams = {};
            _.each(options.elements, _.bind(function (params, key) {
                if (params.type === 'form') {
                    delete params.type;
                    this._fieldsetsParams[key] = params;
                } else {
                    // is main fieldset
                    mainFieldset.elements[key] = params;
                    this._fieldsetsParams[self.MAIN_FIELDSET_KEY] = mainFieldset;
                }
            }, this));

            // Save buttons params
            this._buttonsParams = options.buttons || {};

            // @todo
            if (options.proxy) {
                this.proxy = options.proxy;
                this.on('submit', _.bind(function () {
                    // Update scenario

                    // Validate form
                    if (!this.validate()) {
                        return;
                    }

                    // Send request
                    var deferred = this.proxy.update(this.getAttributes());

                    // Set errors, if exists or run trigger update as success updated form
                    deferred.done(_.bind(function (data) {
                        if (data.errors) {
                            this.setErrors(data.errors);
                        } else {
                            this.trigger('update');
                        }
                    }, this));

                    // Set global failure message
                    deferred.fail(_.bind(function (error) {
                        // @todo Set error in top of from errors area
                        console.error('FormWidget:', error);
                    }, this));
                }, this));
            }
        },

        createChildren: function () {
            // Render fieldsets list
            this.fieldsets = {};
            _.each(this._fieldsetsParams, _.bind(function (options, name) {
                // Get field class and check exists it
                var FieldsetClass = Joints.namespace(this.fieldsetClassName);
                if (!_.isFunction(FieldsetClass)) {
                    throw new Jii.exceptions.ApplicationException('Not find fieldset class `' + this.fieldsetClassName + '`.');
                }

                this.fieldsets[name] = new FieldsetClass(_.extend(options, {
                    appendTo: this.$el
                }));
            }, this));


            // Render buttons row template
            var buttonsRow = $(this.buttonsRowTemplate()).appendTo(this.$el);

            // Render buttons
            this.buttons = {};
            _.each(this._buttonsParams, _.bind(function (options, name) {
                // Get button class and check exists it
                var ButtonClass = Joints.namespace(this.buttonClassName);
                if (!_.isFunction(ButtonClass)) {
                    throw new Jii.exceptions.ApplicationException('Not find button class `' + this.buttonClassName + '`.');
                }

                this.buttons[name] = new ButtonClass(_.extend(options, {
                    appendTo: buttonsRow
                }));
            }, this));
        },

        /**
         * Commit form and validate models
         * @returns {boolean}
         */
        validate: function () {
            var isSuccess = true;
            _.each(this.fieldsets, function (fieldset) {
                if (!fieldset.validate()) {
                    isSuccess = false;
                }
            });
            return isSuccess;
        },

        /**
         * Set values from form to models
         */
        commit: function () {
            _.each(this.fieldsets, function (fieldset) {
                fieldset.commit();
            });
        },

        /**
         * Set errors
         * @param errors
         */
        setErrors: function (errors) {
            if (!_.isObject(errors) || _.isEmpty(errors)) {
                return;
            }

            // Store errors for main fieldset
            var mainFieldsetErrors = {};

            // Set errors to fieldsets
            _.each(errors, function (params, name) {
                if (_.has(this.fieldsets, name)) {
                    this.fieldsets[name].setErrors(params);
                } else {
                    mainFieldsetErrors[name] = params;
                }
            });

            // Set errors to main fieldsets, if exists
            if (!_.isEmpty(mainFieldsetErrors)) {
                this.fieldsets[self.MAIN_FIELDSET_KEY].setErrors(mainFieldsetErrors);
            }
        },

        /**
         * Get all attributes from form
         * @returns {}
         */
        getAttributes: function () {
            var attributes = {};
            _.each(this.fieldsets, function (fieldset, name) {
                if (name === self.MAIN_FIELDSET_KEY) {
                    _.extend(attributes, fieldset.getAttributes());
                } else {
                    attributes[name] = fieldset.getAttributes();
                }
            });
            return attributes;
        },

        /**
         * Update form fields
         * @param {object} attributes
         */
        setAttributes: function (attributes) {
            // Store attributes for main fieldset
            var mainFieldsetAttributes = {};

            // Set attributes
            _.each(attributes, function (value, name) {
                if (_.has(this.fieldsets, name)) {
                    this.fieldsets[name].setAttributes(value);
                } else {
                    mainFieldsetAttributes[name] = value;
                }
            });

            // Set attributes to main fieldset
            if (!_.isEmpty(mainFieldsetAttributes)) {
                this.fieldsets[self.MAIN_FIELDSET_KEY].setAttributes(mainFieldsetAttributes);
            }
        }
    }, {
        MAIN_FIELDSET_KEY: '__main',

        _currentIndex: 1,

        getNextIndex: function () {
            return self._currentIndex++;
        }
    });


})();