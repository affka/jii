/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.User
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.User', Jii.base.Component, {

    uid: null,
    name: '',
    model: null,
    modelClassName: null,

    isGuest: function () {
        return _.isEmpty(this.uid);
    }

});