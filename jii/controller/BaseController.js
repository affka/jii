/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.controller.BaseController
 * @extends Joints.Object
 */
var self = Joints.defineClass('Jii.controller.BaseController', Joints.Object, {

    /**
     * @type {string} The ID of this controller.
     */
    id: null,

    /**
     * @type {Jii.base.Module} The module that this controller belongs to.
     */
    module: null,

    /**
     * @type {string} The ID of the action that is used when the action ID is not specified
     * in the request. Defaults to 'index'.
     */
    defaultAction: null,

    /**
     * Resolves the current request into a route and the associated parameters.
     * @return array the first element is the route, and the second is the associated parameters.
     */
    constructor: function(id, moduleObject, config) {
        this.id = id;
        this.module = moduleObject;
        this._super(config);
    },

    /**
     * Declares external actions for the controller.
     * This method is meant to be overwritten to declare external actions for the controller.
     * It should return an array, with array keys being action IDs, and array values the corresponding
     * action class names or action configuration arrays. For example,
     *
     * ~~~
     * return {
     *     'action1': 'app\components\Action1',
     *     'action2': {
     *         'className': 'app\components\Action2',
     *         'property1': 'value1',
     *         'property2': 'value2'
     *     }
     * };
     * ~~~
     *
     * [[Jii.createObject()]] will be used later to create the requested action
     * using the configuration provided here.
     * @returns {object}
     */
    actions: function() {
        return {};
    },

    /**
     * Runs a request specified in terms of a route.
     * @param {string} route the route to be handled, e.g., 'view', 'comment/view', '/admin/comment/view'.
     * @param {array} params the parameters to be passed to the action.
     * @return {Joints.Deferred}
     */
    run: function(route, params) {
        var slashIndex = route.indexOf('/');
        if (slashIndex === -1) {
            return this.runAction(route, params);
        } else if (slashIndex > 0) {
            return this.module.runAction(route, params);
        }

        route = _.ltrim(route, '/');
        return Jii.app.runAction(route, params);
    },

    /**
     * Runs an action within this controller with the specified action ID and parameters.
     * If the action ID is empty, the method will use [[defaultAction]].
     * @param {string} id The ID of the action to be executed.
     * @param {object} params The parameters (name-value pairs) to be passed to the action.
     * @return {*} The result of the action.
     * @throws {Jii.exceptions.InvalidRouteException} if the requested action ID cannot be resolved into an action successfully.
     */
    runAction: function(id, params) {
        var action = this.createAction(id);
        if (action === null) {
            throw new Jii.exceptions.InvalidRouteException(Jii.t('jii', 'Unable to resolve the request: ' + this.getUniqueId() + '/' . id));
        }

        return Joints.when.apply(this, [
            this.module.beforeAction(action),
            this.beforeAction(action)
        ]).then(function(isValid1, isValid2) {
            if (!isValid1 || !isValid2) {
                return;
            }

            //action.runWithParams(params);
        });
    },

    createAction: function(id) {
        if (id === '') {
            id = this.defaultAction;
        }

        var actionMap = this.actions();
        if (_.has(actionMap, id)) {
            return Jii.createObject(actionMap[id], id, this);
        } else if (/^[a-z0-9\\-_]+$/.test(id)) {
            var method = id.charAt(0).toUpperCase() + id.slice(1);
            method = 'action' + method.replace('-', ' ');

            if (_.isFunction(this[method])) {
                return new Jii.controller.InlineAction(id, this, method);
            }
        }

        return null;
    },

    /**
     * @return string the controller ID that is prefixed with the module ID (if any).
     */
    getUniqueId: function () {
        return this.module instanceof Jii.base.Application ? this.id : this.module.getUniqueId() + '/' + this.id;
    },

    /**
     * This method is invoked right before an action is to be executed (after all possible filters).
     * @param {Jii.controller.BaseAction} action
     * @return {boolean} whether the action should continue to be executed.
     */
    beforeAction: function(action) {
        return true;
    },

    /**
     * This method is invoked right after an action is executed.
     * @param {Jii.controller.BaseAction} action
     */
    afterAction: function(action) {
    }

});
