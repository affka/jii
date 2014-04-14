/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.menu.MenuModel
 * @extends Joints.RelationalModel
 */
Joints.defineClass('Jii.widgets.menu.MenuModel', Joints.RelationalModel, {

    defaults: {
        label: '',
        url: 'javascript: void(0)',
        isMain: null,
        click: null,
        count: null,
        visible: null,
        htmlOptions: null
    },

    initialize: function() {
        this.on('change:url', this.checkMainUrl, this);
    },

    checkMainUrl: function() {
        if (_.str.endsWith(this.get('url'), '*')) {
            this.set({
                isMain: true,
                url: _.str.rtrim(this.get('url'), '*')
            }, {
                silent: true
            });
        }
    }

});
