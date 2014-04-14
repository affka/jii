/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {


    /**
     * @class Jii.controller.InlineAction
     * @extends Jii.controller.BaseAction
     */
    var self = Joints.defineClass('Jii.controller.InlineAction', Jii.controller.BaseAction, {

        /**
         * @type {string} the controller method that  this inline action is associated with
         */
        actionMethod: null,

        constructor: function (id, controller, actionMethod, config) {
            this.actionMethod = actionMethod;
            this._super(id, controller, config);
        },

        /**
         * Runs this action with the specified parameters.
         * This method is mainly invoked by the controller.
         * @param {Jii.controller.BaseRequest} request
         * @param {Jii.controller.BaseResponse} response
         * @returns {*} the result of the action
         */
        runWithParams: function (request, response) {
            return this.controller[this.actionMethod].call(this.controller, request, response);
        }
    });

})();