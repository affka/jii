/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class app.controllers.SiteController
 * @extends Jii.controller.BaseController
 */
var self = Joints.defineClass('app.controllers.SiteController', Jii.controller.BaseController, {

    actionIndex: function(request, response) {
        var view = new Jii.view.View({
            template: '<div>qwe <b>111</b></div>'
        });

        response.data = view.$el.parent().html();
        response.send();
    }

});
