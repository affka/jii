/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.BaseAction
 * @extends Joints.Object
 */
var self = Joints.defineClass('Jii.controller.BaseAction', Joints.Object, {

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
     * @param {Jii.controller.BaseRequest} request
     * @param {Jii.controller.BaseResponse} response
     */
    run: function(request, response) {
    },

    /**
     * Runs this action with the specified parameters.
     * This method is mainly invoked by the controller.
     * @param {Jii.controller.BaseRequest} request
     * @param {Jii.controller.BaseResponse} response
     * @returns {Joints.Deferred} the result of the action
     * @throws {Jii.exceptions.InvalidConfigException} if the action class does not have a run() method
     */
    runWithParams: function(request, response) {
        if (!_.isFunction(this.run)) {
            throw new Jii.exceptions.InvalidConfigException(this.debugClassName + ' must define a `run()` method.');
        }

        //Yii::trace('Running action: ' . get_class($this) . '::run()', __METHOD__);

        return Joints.when(this.beforeRun(request, response)).then(_.bind(function(bool) {
            if (!bool) {
                return false;
            }

            return this.run(request, response);
        }, this)).then(function(result) {
            return Joints.when(this.afterRun().then(function() {
                return result;
            }));
        });
    },

    /**
     * This method is called right before `run()` is executed.
     * You may override this method to do preparation work for the action run.
     * If the method returns false, it will cancel the action.
     * @param {Jii.controller.BaseRequest} request
     * @param {Jii.controller.BaseResponse} response
     * @return {Joints.Deferred|boolean} whether to run the action.
     */
    beforeRun: function(request, response) {
        return true;
    },

    /**
     * This method is called right after `run()` is executed.
     * You may override this method to do post-processing work for the action run.
     */
    afterRun: function() {
    }
});
