/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.menu.TabModel
 * @extends Joints.RelationalModel
 */
Joints.defineClass('Jii.widgets.menu.TabModel', Joints.RelationalModel, {

    attributes: {
        label: '',
        view: null,
        isActive: false
    }

});
