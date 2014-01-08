/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.tabs.TabsWidget
 * @extends Jii.base.Widget
 */
Joints.defineClass('Jii.widgets.tabs.TabsWidget', Jii.base.Widget, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/tabs/tabs.html')),

    collection: null,

    initialize: function(options) {
        options = options || {};

        this.collection = new Joints.Collection(options.items || [], {
            model: Jii.widgets.tabs.TabModel
        });
    },

    createChildren: function() {
        Joints.collectionScanAndBind(this.collection, _.bind(function(model) {
            // Create item views
            new Jii.widgets.tabs.TabItemView({
                appendTo: this.$('nav ul'),
                model: model
            });
        }, this));

        // Select first view
        this.selectTab(this.collection.at(0));
    },

    selectTab: function(model) {
        // Find active tab
        var activeModel = this.collection.find(function(model) {
            return model.get('isActive') === true;
        });

        // Skip already selected tab
        if (activeModel === model || model.get('isActive') === true) {
            return;
        }

        // Deselect previous tab
        if (activeModel) {
            activeModel.set('isActive', false);
        }

        // Set new content
        model.set('isActive', true);
        this.$('.tabs-content').html(model.get('view').$el);

    }
});

