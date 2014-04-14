/**
 * @class Jii.widgets.form.fields.TextField
 * @extends Jii.widgets.form.BaseField
 */
Joints.defineClass('Jii.widgets.form.fields.TextField', Jii.widgets.form.BaseField, {

    template: _.template("<input type='<%- type %>' name='<%- attribute %>' tabindex='<%- index %>' />"),

    type: 'text',

    getTemplateData: function() {
        return _.extend(this._super(), {
            type: this.type
        });
    },

    onRender: function () {
        this._super();
    },

    /**
     * Set field value
     * @param {*} value
     */
    setValue: function(value) {
        this.$el.val(value);
    },

    /**
     * Get field value
     * @return {*}
     */
    getValue: function() {
        return this.$el.val();
    }
});

