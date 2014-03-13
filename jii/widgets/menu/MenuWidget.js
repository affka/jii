/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.menu.MenuWidget
 * @extends Jii.base.Widget
 */
Joints.defineClass('Jii.widgets.menu.MenuWidget', Jii.base.Widget, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/menu/menu.html')),

    collection: null,

    initialize: function(options) {
        options = options || {};

        this.collection = new Joints.Collection(options.items || [], {
            model: Jii.widgets.menu.MenuModel
        });

        this.templateData = {
            title: options.title || ''
        };
    },

    onRender: function() {
        if (this.options.name) {
            this.$el.addClass('menu-' + this.options.name);
        }

        this.$('h1').toggle( this.options.title ? true : false );
    },

    createChildren: function() {

        Joints.collectionScanAndBind(this.collection, _.bind(function(model) {

            // Create item views
            new Jii.widgets.menu.MenuItemView({
                appendTo: this.$('ul'),
                model: model,
                schedule: this
            });
        }, this));
    }
});

