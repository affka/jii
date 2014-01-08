/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.form.Button
 * @extends Joints.StickyView
 */
Joints.defineClass('Jii.widgets.form.Button', Joints.StickyView, {

    template: _.template("<input type='button' value='<%- label %>' tabindex='<%- index %>' />"),

    _coreTypes: {
        'htmlButton': 'htmlButton',
        'htmlSubmit': 'htmlButton',
        'htmlReset': 'htmlButton',
        'button': 'button',
        'submit': 'submitButton',
        'reset': 'resetButton',
        'image': 'imageButton',
        'link': 'linkButton'
    },

    onRender: function() {
        this.$el.on('click', _.bind(this._onClick, this));
    },

    _onClick: function() {
        if (this.options.type === 'submit') {
            this.parentView().trigger('submit', this);
        }

        if (_.isFunction(this.options.click)) {
            this.options.click.call(this);
        }
    },

    getTemplateData: function() {
        return _.extend(this._super(), {
            label: this.options.label || 'Submit',
            index: Jii.widgets.form.FormWidget.getNextIndex()
        });
    }
});

