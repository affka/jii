/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class app.server.controllers.SiteController
 * @extends Jii.controller.BaseController
 */
var self = Joints.defineClass('app.server.controllers.SiteController', Jii.controller.BaseController, {

    actions: function() {
        return {
            static: 'Jii.controller.actions.StaticAction'
        };
    },

    actionIndex: function(request, response) {
        // Sticky
        /*var view = new Jii.view.View({
            template: '<div>qwe <b>111</b></div>'
        });
        var html = view.$el.parent().html()*/

        // Simple
        /*var html = Jii.app.viewManager.render('@app/views/layout/main', {
            content: 111
        });*/

        // By controller
        var html = this.render('index');

        response.data = html;
        response.send();
    },

    actionAbout: function(request, response) {
        response.data = this.render('about');
        response.send();
    }

});
