/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.exceptions.ApplicationException
 * @extends Error
 */
var self = Joints.defineClass('Jii.exceptions.ApplicationException', Error, {

    constructor: function(message) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, self);
        }
        this.name = this.debugClassName;
        this.message = message || '';
    }
});
