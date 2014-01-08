/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * Events:
 *  - beforeRoute(route, params)
 *  - afterRoute(route, params, action)
 * @class Jii.components.router.ClientRouter
 * @extends Jii.components.router.BaseRouter
 */
var self = Joints.defineClass('Jii.components.router.ClientRouter', Jii.components.router.BaseRouter, {

    /**
     * @type {Jii.base.action.BaseAction|null}
     */
    _previousAction: null,

    /**
     * @type {Jii.base.action.BaseAction|null}
     */
    _currentAction: null,

    /**
     * @type {Jii.base.Module|null}
     */
    _currentModule: null,

    /**
     * @type {Backbone.Router}
     */
    _backboneRouter: null,

    /**
     * @type {boolean}
     */
    _isRouteInProcess: null,

    init: function () {
        // Используем стандартный роутер бэкбона для парсинга и отслеживания экшенов
        this._backboneRouter = new Backbone.Router();

        this._super();
    },

    /**
     * Start listen http queries
     */
    start: function () {
        if (Backbone.history) {
            Backbone.history.start({
                pushState: true // @todo Нужно этот параметр добавить в конфиг и обрабатывать его значение false
                //root: App.config.get('baseUrl')+'/'
            });

            $(document).on('click', 'a', _.bind(function (e) {
                var url = $(e.target).attr('href');

                // Find route
                var fragment = Backbone.history.getFragment(url);
                var matched = _.any(Backbone.history.handlers, function(handler) {
                    if (handler.route.test(fragment)) {
                        return true;
                    }
                });

                // Navigate as simple page application, if fined
                if (matched) {
                    e.preventDefault();
                    this._backboneRouter.navigate(url, true);
                }
            }, this));
        }
    },

    /**
     * Redirect user to another url
     * @param {string} url
     */
    redirect: function (url) {
        // Skip, if routing in process
        if (this._isRouteInProcess) {
            return;
        }
        this._backboneRouter.navigate(url, true);
    },

    /**
     * Redirect user to previous url
     * @todo Save and set previous url
     */
    redirectBack: function () {
        this.redirect(this._previousAction ? this._previousAction.path : '');
    },

    /**
     * Return action instance for current page
     * @returns {Jii.base.action.BaseAction|null}
     */
    getCurrentAction: function() {
        return this._currentAction;
    },

    /**
     * Return module instance for current action
     * @returns {Jii.base.Module|null}
     */
    getCurrentModule: function() {
        return this._currentModule;
    },

    /**
     * Initialize route item
     * @param {string} className
     * @param {string} route
     * @private
     */
    _initRoute: function (className, route) {
        this._backboneRouter.route(route, className, _.bind(function() {
            this._onRoute(route, arguments);
        }, this));
    },

    /**
     * @param {Backbone.Router} router
     * @param {object} route
     * @param {object} params
     * @private
     */
    _onRoute: function (path, paramsList) {
        if (!_.has(this.routes, path)) {
            throw new Jii.exceptions.ApplicationException('Path `' + path + '` is not registered in config.');
        }

        // Store options here
        var runOptions = {
            params: {},
            path: window.location.pathname
        };

        // Search params in path
        var match;
        var i = 0;
        var tempPath = path;
        while (true) {
            match = /:([a-z]+)/gi.exec(tempPath);
            if (!match) {
                break;
            }

            tempPath = tempPath.replace(match[0], '');
            runOptions.params[match[1]] = paramsList[i++];
        }

        // Run route event
        this.trigger('beforeRoute', path, runOptions);

        // Mark routing in process
        this._isRouteInProcess = true;

        // Save previous action
        this._previousAction = this._currentAction;

        // Unload previous action and reset current action and module
        if (this._currentAction !== null) {
            this._currentAction.stop();
        }
        this._currentAction = null;
        this._currentModule = null;

        var route = this.routes[path];
        this.runAction(route, runOptions).done(_.bind(function(action, module) {
            // Save current action and module
            this._currentAction = action;
            this._currentModule = module;

            // Mark routing end process
            this._isRouteInProcess = false;

            // Run route event
            this.trigger('afterRoute', runOptions, action);
        }, this));
    }
});
