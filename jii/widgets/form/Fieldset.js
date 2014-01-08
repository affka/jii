/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.form.Fieldset
 * @extends Joints.StickyView
 */
Joints.defineClass('Jii.widgets.form.Fieldset', Joints.StickyView, {

    template: _.template('<fieldset></fieldset>'),
    rowTemplate: _.template(RIABuilder.getTemplate('lib/jii/widgets/form/templates/row.html')),

    model: null,
    title: null,
    description: null,
    elements: null,

    fields: null,

    _coreTypes: {
        'text': 'Jii.widgets.form.fields.TextField',
        'hidden': 'Jii.widgets.form.fields.HiddenField',
        'password': 'Jii.widgets.form.fields.PasswordField',
        'textarea': 'Jii.widgets.form.fields.TextArea',
        'file': 'Jii.widgets.form.fields.FileField',
        'radio': 'Jii.widgets.form.fields.RadioButton',
        'checkbox': 'Jii.widgets.form.fields.CheckBox',
        'listbox': 'Jii.widgets.form.fields.ListBox',
        'dropdownlist': 'Jii.widgets.form.fields.DropDownList',
        'checkboxlist': 'Jii.widgets.form.fields.CheckBoxList',
        'radiolist': 'Jii.widgets.form.fields.RadioButtonList',
        'url': 'Jii.widgets.form.fields.UrlField',
        'email': 'Jii.widgets.form.fields.EmailField',
        'number': 'Jii.widgets.form.fields.NumberField',
        'range': 'Jii.widgets.form.fields.RangeField',
        'date': 'Jii.widgets.form.fields.DateField'
    },

    initialize: function (options) {
        _.extend(this, _.pick(options, [
            'model',
            'title',
            'description',
            'elements',
            'startIndex'
        ]));

        if (!this.model) {
            throw new Jii.exceptions.ApplicationException('Not find model in fieldset.');
        }
    },

    onRender: function () {
        if (this.title) {
            this.$el.append("<legend>" + this.title + "</legend>");
        }

        if (this.description) {
            this.$el.append("<div class='description'>" + this.description + "</div>");
        }
    },

    createChildren: function () {
        this.fields = {};
        _.each(this.elements, _.bind(function (options, attribute) {
            // Get field class name
            var FieldClassName = this._coreTypes[options.type] || options.type;
            var FieldClass = Joints.namespace(FieldClassName);
            if (!_.isFunction(FieldClass)) {
                throw new Jii.exceptions.ApplicationException('Not find field class `' + FieldClassName + '`.');
            }

            // Render row template
            var rowHtml = this.rowTemplate({
                attribute: attribute,
                label: options.label || this.model.getAttributeLabel(attribute),
                field: "<div class='tmp-field'></div>"
            });
            var row = $(rowHtml).appendTo(this.$el);

            // Add row class for search row by selector
            row.addClass('row-' + attribute);

            // Render field
            this.fields[attribute] = new FieldClass(_.extend(options, {
                replaceEl: row.find('.tmp-field'),
                attribute: attribute,
                model: this.model
            }));
        }, this));
    },

    /**
     * Get attributes values from form
     * @returns {object}
     */
    getAttributes: function() {
        var attributes = {};
        _.each(this.fields, function(field, name) {
            attributes[name] = field.getValue();
        });
        return attributes;
    },

    /**
     * Update fields values in gui
     * @param {object} attributes
     */
    setAttributes: function(attributes) {
        _.each(attributes, function(value, name) {
            if (_.has(this.fields, name)) {
                this.fields[name].setValue(value);
            }
        });
    },

    /**
     * Clean old errors from gui
     */
    cleanErrors: function() {
        this.$('.row .error').text('');
    },

    /**
     * Render errors
     * @param {object} errors
     */
    setErrors: function(errors) {
        _.each(errors, _.bind(function(errorsList, attribute) {
            this.$('.row-' + attribute + ' .error').text(errorsList.join(', '));
        }, this));
    },

    /**
     * Set attributes from form to model
     */
    commit: function() {
        this.model.update(this.getAttributes());
    },

    /**
     * Commit fieldset, validate model and render errors, if it exists
     * @returns {boolean}
     */
    validate: function() {
        // Clean old errors
        this.cleanErrors();

        // Set attributes from form to model
        this.commit();

        // Run model validation
        var hasErrors = this.model.validate();

        // Render errors
        this.setErrors(this.model.getErrors());

        return hasErrors;
    }
});

