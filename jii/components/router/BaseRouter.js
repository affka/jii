/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.router.BaseRouter
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.router.BaseRouter', Jii.base.Component, {

    /**
     * Key-value object, where key - route and
     * value - class name with namespace
     * @type {object}
     */
    routes: null,

    init: function () {
        // Init routes
        _.each(this.routes, this._initRoute.bind(this));
    },

    /**
     * Start listen http queries
     */
    start: function () {
    },

    /**
     * Stop listen http queries
     */
    stop: function () {
    },

    /**
     * Initialize route item
     * @param {string} className
     * @param {string} route
     * @protected
     */
    _initRoute: function (className, route) {
    },

    /**
     * @protected
     */
    _onRoute: function () {
    },

    /**
     * @param {string} path
     * @return {object}
     * @protected
     */
    _parseRoute: function(route) {
        var module = null;
        var actionNamespace = null;
        var actionClassName = null;

        // Normalize route
        route.replace(/^\/(.+)\/$/, '$1');

        // Parse route for get action class name
        var routeParams = route.split('/');
        if (routeParams.length === 2) {
            if (routeParams[0] === 'jii') {
                module = Jii.app;
                actionNamespace = 'Jii.actions';
            } else {
                module = Jii.app.getModule(routeParams[0]);
                if (!module) {
                    throw new Jii.exceptions.ApplicationException('Not found module `' + routeParams[0] + '`');
                }
                actionNamespace = module.actionNamespace || module.debugClassName.split('.').slice(0, -1).join('.') + '.actions';
            }
            actionClassName = routeParams[1];
        } else if (routeParams.length === 1) {
            module = Jii.app;
            actionNamespace = module.actionNamespace || 'app.actions';
            actionClassName = routeParams[0];
        } else {
            throw new Jii.exceptions.ApplicationException('Wrong route format: `' + route + '`.');
        }

        // Normalize action class name:
        //  - Set first char to upper case
        //  - Add Action suffix
        //  - Prepend namespace
        actionClassName = actionClassName.charAt(0).toUpperCase() + actionClassName.substr(1, actionClassName.length-1);
        actionClassName = actionNamespace + '.' + actionClassName + 'Action';

        // Get action class
        var ActionClass = Joints.namespace(actionClassName);
        if (!_.isFunction(ActionClass)) {
            throw new Jii.exceptions.ApplicationException('Not find action class `' + actionClassName + '`. Please require it.');
        }

        return {
            module: module,
            ActionClass: ActionClass
        };
    },

    /**
     *
     * @param {string} path
     * @returns {boolean}
     */
    isRegisteredPath: function(path) {
        return _.has(this.routes, path);
    },

    /**
     *
     * @param {string} route
     * @return {Joints.Deferred}
     */
    runAction: function (route) {
        var deferred = new Joints.Deferred();
        var routeParams = this._parseRoute(route);

        // Create instance and initialize
        var action = new routeParams.ActionClass();
        action.owner = this;

        // Initialize action
        action.init.apply(action, _.rest(arguments));

        // Check access
        action.checkCanAccess().done(function(bool) {
            if (bool) {
                // Run
                Jii.app.logger.debug('Run action `%s`.', action.debugClassName);
                action.run();

                deferred.resolve(action);
            } else {
                action.setStatusCode(403);
                action.send(); // @todo Заменить в пользу исключений, наверное

                deferred.reject(action, routeParams.module);
            }
        });

        return deferred.promise();
    }
});
