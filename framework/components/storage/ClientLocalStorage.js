/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.storage.ClientLocalStorage
 * @extends Jii.base.Object
 */
Joints.defineClass('Jii.components.storage.ClientLocalStorage', Jii.base.Object, {

    get: function (key) {
        return localStorage.getItem(key);
    },

    set: function (key, value) {
        localStorage.setItem(key, value);
    },

    remove: function(key) {
        localStorage.removeItem(key);
    }

});
