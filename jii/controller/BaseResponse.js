/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.BaseResponse
 * @extends Jii.base.Object
 */
var self = Joints.defineClass('Jii.controller.BaseResponse', Jii.base.Object, {

    /**
     * @var {boolean} whether the response has been sent. If this is true, calling [[send()]] will do nothing.
     */
    isSent: false,

    /**
     * Sends the response to client.
     */
    send: function() {
    }

});
