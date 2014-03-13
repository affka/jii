/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.tabs.TabItemView
 * @extends Joints.StickyView
 */
Joints.defineClass('Jii.widgets.tabs.TabItemView', Joints.StickyView, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/tabs/tabItem.html')),

    initialize: function() {
        this.model.on('change:isActive', _.bind(function() {
            if (this.model.get('isActive')) {
                this._selectTab();
            } else {
                this._unSelectTab();
            }
        }, this));
    },

    onRender: function() {
        this.$('a').on('click', _.bind(function() {
            this.parentView().selectTab(this.model);
        }, this));
    },

    _selectTab: function() {
        this.$el.addClass('active');
    },

    _unSelectTab: function() {
        this.$el.removeClass('active');
    }

});
