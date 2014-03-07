/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.Action
 * @extends Joints.Object
 */
var self = Joints.defineClass('Jii.controller.Action', Joints.Object, {

    /**
     * @type {string} ID of the action
     */
    id: null,

    /**
     * @type {Jii.controller.BaseController} the controller that owns this action
     */
    controller: null,

    constructor: function(id, controller, config) {
        this.id = id;
        this.controller = controller;
        this._super(config);
    },

    /**
     * Returns the unique ID of this action among the whole application.
     * @returns {string} the unique ID of this action among the whole application.
     */
    getUniqueId: function() {
        return this.controller.getUniqueId() + '/' + this.id;
    },

    /**
     * Runs this action with the specified parameters.
     * This method is mainly invoked by the controller.
     * @param {array} params the parameters to be bound to the action's run() method.
     * @returns {*} the result of the action
     * @throws {Jii.exceptions.InvalidConfigException} if the action class does not have a run() method
     */
    runWithParams: function(params) {
        if (!_.isFunction(this.run)) {
            throw new Jii.exceptions.InvalidConfigException(this.debugClassName + ' must define a `run()` method.');
        }

        // @todo request, response
        return this.run(params);
    }
});
