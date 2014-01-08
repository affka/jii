/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.menu.MenuItemView
 * @extends Joints.StickyView
 */
Joints.defineClass('Jii.widgets.menu.MenuItemView', Joints.StickyView, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/menu/menuItem.html')),

    style: 'default',

    initialize: function() {
        //this.model.on('change:visible', this.checkVisible, this);
        this.model.on('change:url change:isMain', this.checkActive, this);
        //this.model.on('change', this.render, this);
        Jii.app.router.on('afterRoute', $.proxy(this.checkActive, this));
    },

    onRender: function() {
        if (this.model.get('click') && _.isFunction(this.model.get('click'))) {
            var self = this;
            this.$('a')
                .on('click', function() {
                    self.model.get('click').call(self);
                });
        }

        // @todo
        if (this.model.get('htmlOptions')) {
            this.$el.removeClass();
            this.$el.attr(this.model.get('htmlOptions'));
            this.$el.addClass('stickyView');
        }

        this.checkActive();
        this.checkVisible();
    },

    checkActive: function() {
        this.$el.removeClass('active');

        var routerUrl = window.location.pathname;
        if (this.model.get('url') === routerUrl || (this.model.get('isMain') && routerUrl.indexOf(this.model.get('url')) === 0)) {
            this.$el.addClass('active');
        }
    },

    checkVisible: function() {
        /*if (this.model.get('visible') !== null) {
            var visible = this.model.get('visible');
            if (_.isString(visible)) {
                visible = {rule: visible};
            }

            if (_.isBoolean(visible)) {
                this.$el.toggle(visible);
            } else {
                App.logic.on(visible.rule, visible.options||{}, this.$el.toggle, this.$el);
            }
        }*/
    }

});
