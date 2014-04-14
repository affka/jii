/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

;
(function () {


    /**
     * @class Jii.controller.BaseController
     * @extends Jii.base.Object
     */
    var self = Joints.defineClass('Jii.controller.BaseController', Jii.base.Object, {

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
         * @type {string|boolean} the name of the layout to be applied to this controller's views.
         * This property mainly affects the behavior of [[render()]].
         * Defaults to null, meaning the actual layout value should inherit that from [[module]]'s layout value.
         * If false, no layout will be applied.
         */
        layout: null,

        /**
         * The view object that can be used to render views or view files.
         * @type {Jii.app.view.BaseViewManager}
         */
        _view: null,

        /**
         * @constructor
         */
        constructor: function (id, moduleObject, config) {
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
        actions: function () {
            return {};
        },

        /**
         * Runs a request specified in terms of a route.
         * @param {string} route the route to be handled, e.g., 'view', 'comment/view', 'admin/comment/view'.
         * @param {Jii.controller.BaseRequest} request
         * @param {Jii.controller.BaseResponse} response
         * @return {Joints.Deferred}
         */
        run: function (route, request, response) {
            var slashIndex = route.indexOf('/');
            if (slashIndex === -1) {
                return this.runAction(route, request, response);
            } else if (slashIndex > 0) {
                return this.module.runAction(route, request, response);
            }

            route = _.ltrim(route, '/');
            return Jii.app.runAction(route, request, response);
        },

        /**
         * Runs an action within this controller with the specified action ID and parameters.
         * If the action ID is empty, the method will use [[defaultAction]].
         * @param {string} id The ID of the action to be executed.
         * @param {Jii.controller.BaseRequest} request
         * @param {Jii.controller.BaseResponse} response
         * @return {Joints.Deferred} The result of the action.
         * @throws {Jii.exceptions.InvalidRouteException} if the requested action ID cannot be resolved into an action successfully.
         */
        runAction: function (id, request, response) {
            var action = this.createAction(id);
            if (action === null) {
                throw new Jii.exceptions.InvalidRouteException(Jii.t('jii', 'Unable to resolve the request: ' + this.getUniqueId() + '/' + id));
            }

            return Joints.when.apply(this, [
                    this.module.beforeAction(action),
                    this.beforeAction(action)
                ]).then(function (isValid1, isValid2) {
                if (!isValid1 || !isValid2) {
                    return false;
                }

                return action.runWithParams(request, response);
            });
        },

        /**
         * Creates an action based on the given action ID.
         * The method first checks if the action ID has been declared in [[actions()]]. If so,
         * it will use the configuration declared there to create the action object.
         * If not, it will look for a controller method whose name is in the format of `actionXyz`
         * where `Xyz` stands for the action ID. If found, an [[InlineAction]] representing that
         * method will be created and returned.
         * @param {string} id the action ID.
         * @return {Jii.controller.BaseAction} the newly created action instance. Null if the ID doesn't resolve into any action.
         */
        createAction: function (id) {
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
        beforeAction: function (action) {
            return true;
        },

        /**
         * This method is invoked right after an action is executed.
         * @param {Jii.controller.BaseAction} action
         */
        afterAction: function (action) {
        },

        /**
         * Renders a view and applies layout if available.
         *
         * The view to be rendered can be specified in one of the following formats:
         *
         * - path alias (e.g. "@app/views/site/index");
         * - absolute path within application (e.g. "//site/index"): the view name starts with double slashes.
         *   The actual view file will be looked for under the [[Application::viewPath|view path]] of the application.
         * - absolute path within module (e.g. "/site/index"): the view name starts with a single slash.
         *   The actual view file will be looked for under the [[Module::viewPath|view path]] of [[module]].
         * - relative path (e.g. "index"): the actual view file will be looked for under [[viewPath]].
         *
         * To determine which layout should be applied, the following two steps are conducted:
         *
         * 1. In the first step, it determines the layout name and the context module:
         *
         * - If [[layout]] is specified as a string, use it as the layout name and [[module]] as the context module;
         * - If [[layout]] is null, search through all ancestor modules of this controller and find the first
         *   module whose [[Module::layout|layout]] is not null. The layout and the corresponding module
         *   are used as the layout name and the context module, respectively. If such a module is not found
         *   or the corresponding layout is not a string, it will return false, meaning no applicable layout.
         *
         * 2. In the second step, it determines the actual layout file according to the previously found layout name
         *    and context module. The layout name can be:
         *
         * - a path alias (e.g. "@app/views/layouts/main");
         * - an absolute path (e.g. "/main"): the layout name starts with a slash. The actual layout file will be
         *   looked for under the [[Application::layoutPath|layout path]] of the application;
         * - a relative path (e.g. "main"): the actual layout layout file will be looked for under the
         *   [[Module::layoutPath|layout path]] of the context module.
         *
         * If the layout name does not contain a file extension, it will use the default one `.php`.
         *
         * @param {string} view   the view name. Please refer to [[findViewFile()]] on how to specify a view name.
         * @param {object} [params] the parameters (name-value pairs) that should be made available in the view.
         * These parameters will not be available in the layout.
         * @return {string} the rendering result.
         */
        render: function (view, params) {
            params = params || {};

            var output = this.getView().render(view, params, this);
            var layoutFile = this._findLayoutFile(this.getView());
            if (layoutFile !== false) {
                return this.getView().renderFile(layoutFile, {content: output}, this);
            }

            return output;
        },

        /**
         * Renders a view.
         * This method differs from [[render()]] in that it does not apply any layout.
         * @param  {string} view   the view name. Please refer to [[render()]] on how to specify a view name.
         * @param  {object} [params] the parameters (name-value pairs) that should be made available in the view.
         * @return {string} the rendering result.
         */
        renderPartial: function (view, params) {
            params = params || {};

            return this.getView().render(view, params, this);
        },

        /**
         * Renders a view file.
         * @param  {string} file   the view file to be rendered. This can be either a file path or a path alias.
         * @param  {object} [params] the parameters (name-value pairs) that should be made available in the view.
         * @return {string} the rendering result.
         */
        renderFile: function (file, params) {
            params = params || {};

            return this.getView().renderFile(file, params, this);
        },

        /**
         * Returns the view object that can be used to render views or view files.
         * The [[render()]], [[renderPartial()]] and [[renderFile()]] methods will use
         * this view object to implement the actual view rendering.
         * If not set, it will default to the "view" application component.
         * @return {Jii.app.view.BaseViewManager} the view object that can be used to render views or view files.
         */
        getView: function () {
            if (this._view === null) {
                this._view = Jii.app.viewManager;
            }

            return this._view;
        },

        /**
         * Sets the view object to be used by this controller.
         * @param {Jii.app.view.BaseViewManager} view the view object that can be used to render views or view files.
         */
        setView: function (view) {
            this._view = view;
        },

        /**
         * Returns the directory containing view files for this controller.
         * The default implementation returns the directory named as controller [[id]] under the [[module]]'s
         * [[viewPath]] directory.
         * @return {string} the directory containing the view files for this controller.
         */
        getViewPath: function () {
            return this.module.getViewPath() + '/' + this.id;
        },

        /**
         * Finds the view file based on the given view name.
         * @param {string} view the view name or the path alias of the view file. Please refer to [[render()]]
         * on how to specify this parameter.
         * @return {string} the view file path. Note that the file may not exist.
         */
        findViewFile: function (view) {
            return this.getViewPath() + '/' + view;
        },

        /**
         * Finds the applicable layout file.
         * @param {Jii.app.view.BaseViewManager} view the view object to render the layout file.
         * @return {string|boolean} the layout file path, or false if layout is not needed.
         * Please refer to [[render()]] on how to specify this parameter.
         */
        _findLayoutFile: function (view) {
            var module = this.module;
            var layout = null;

            if (_.isString(this.layout)) {
                layout = this.layout;
            } else if (this.layout === null) {
                while (module !== null && module.layout === null) {
                    module = module.module;
                }
                if (module !== null && _.isString(module.layout)) {
                    layout = module.layout;
                }
            }

            if (!layout) {
                return false;
            }

            var file = null;
            if (layout.indexOf('@') === 0) {
                file = Jii.getAlias(layout);
            } else if (layout.indexOf('/') === 0) {
                file = Jii.app.getLayoutPath() + '/' + layout.substr(1);
            } else {
                file = module.getLayoutPath() + '/' + layout;
            }

            if (/\.([a-z]+)$/.test(file)) {
                return file;
            }
            return file + '.' + view.defaultExtension;
        }

    });

})();