/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.storage.ClientCookieStorage
 * @extends Jii.base.Object
 */
Joints.defineClass('Jii.components.storage.ClientCookieStorage', Jii.base.Object, {

    get: function (key) {
        var regexp = new RegExp('\\b' + key + '(?:=(.*?))?(;|$)');
        var result = regexp.exec(document.cookie);
        return result ? result[1] || '' : null;
    },

    set: function (key, value, expires) {
        if (expires === true) {
            expires = 'Thu, 01 Jan 2037 00:00:00 GMT';
        }

        document.cookie = key + "=" + encodeURIComponent(value) +
            (expires ? ";expires=" + expires : '') +
            ";domain=." + location.host.replace(/^www\./i, '') + ";path=/";
    },

    remove: function(key) {
        this.set(key, 0, 0);
    }

});