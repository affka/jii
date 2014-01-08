/**
 * @class Jii.widgets.form.fields.DropDownList
 * @extends Jii.widgets.form.BaseField
 */
Joints.defineClass('Jii.widgets.form.fields.DropDownList', Jii.widgets.form.BaseField, {

    template: _.template("<select name='<%- attribute %>' tabindex='<%- index %>'></select>"),

    onRender: function () {
        // Insert empty item
        if (this.options.empty) {
            this._appendOption(this.options.empty, '');
        }

        // Insert items
        _.each(this.options.items || {}, _.bind(this._appendOption, this));

        this._super();
    },

    _appendOption: function(label, value) {
        var option = $("<option />", {
            value: value
        });

        option.text(label);
        option.appendTo(this.$el);
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

