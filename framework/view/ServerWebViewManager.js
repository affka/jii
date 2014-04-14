/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var fs = require('fs');

/**
 * @class Jii.view.ServerWebViewManager
 * @extends Jii.view.BaseViewManager
 */
var self = Joints.defineClass('Jii.view.ServerWebViewManager', Jii.view.BaseViewManager, {

    _loadTemplateSync: function(path) {
        if (!fs.existsSync(path)) {
            throw new Jii.exceptions.ApplicationException('Not found template in path `' + path + '`.');
        }

        var template = fs.readFileSync(path);
        return _.template(template);
    }

});
