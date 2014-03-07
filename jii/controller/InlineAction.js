/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.InlineAction
 * @extends Jii.controller.BaseAction
 */
var self = Joints.defineClass('Jii.controller.InlineAction', Jii.controller.BaseAction, {

    /**
     * @type {string} the controller method that  this inline action is associated with
     */
    actionMethod: null,

    constructor: function(id, controller, actionMethod, config) {
        this.actionMethod = actionMethod;
        this._super(id, controller, config);
    },

    /**
     * Runs this action with the specified parameters.
     * This method is mainly invoked by the controller.
     * @param {array} params the parameters to be bound to the action's run() method.
     * @returns {*} the result of the action
     */
    runWithParams: function(params) {
        // @todo request, response
        return this.controller[this.actionMethod].call(this.controller, params);
    }
});
