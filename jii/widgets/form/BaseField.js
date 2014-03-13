/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.form.BaseField
 * @extends Joints.StickyView
 */
Joints.defineClass('Jii.widgets.form.BaseField', Joints.StickyView, {

    model: null,
    attribute: null,
    index: null,
    style: null,

    initialize: function(options) {
        _.extend(this, _.pick(options, [
            'model',
            'attribute',
            'index',
            'style'
        ]));
    },

    getTemplateData: function() {
        return _.extend(this._super(), {
            attribute: this.attribute,
            index: Jii.widgets.form.FormWidget.getNextIndex()
        });
    },

    onRender: function() {
        this.setValue(this.model.attributes[this.attribute]);
        if (_.isObject(this.style)) {
            this.$el.css(this.style);
        } else if (_.isString(this.style)) {
            this.$el.attr('style', this.style);
        }
    },

    /**
     * Set field value
     * @param {*} value
     */
    setValue: function(value) {
        throw new Jii.exceptions.ApplicationException('Not implemented. Extend and override this method.');
    },

    /**
     * Get field value
     * @return {*}
     */
    getValue: function() {
        throw new Jii.exceptions.ApplicationException('Not implemented. Extend and override this method.');
    }

});

