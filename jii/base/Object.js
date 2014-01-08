/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 *
 * @class Jii.base.Object
 * @extends Joints.Object
 */
Joints.defineClass('Jii.base.Object', Joints.Object, {

    constructor: function(config) {
        if (_.isObject(config)) {
            Jii.configure(this, config);
        }

        this.init();
    },

    init: function() {

    }

}, {

    className: function() {
        return this.debugClassName;
    }

});
