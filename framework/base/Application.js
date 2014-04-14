/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.app.Application
 * @extends Jii.base.Module
 * @property {Jii.components.Db} db
 * @property {Jii.components.HttpServer} http
 * @property {Jii.components.Logger} logger
 * @property {Jii.components.Redis} redis
 * @property {Jii.components.String} string
 * @property {Jii.components.Time} time
 * @property {Jii.components.router.BaseRouter} router
 * @property {Jii.components.request.JsonRpc} rpcRequest
 * @property {Jii.components.User} user
 * @property {Jii.view.BaseViewManager} viewManager
 */
var self = Joints.defineClass('Jii.base.Application', Jii.base.Module, {

    debug: false,

    /**
     * @var {string} the namespace that controller classes are in. If not set,
     * it will use the "app\controllers" namespace.
     */
    controllerNamespace: 'app.controllers',

    /**
     * @var {string} the application name.
     */
    name: 'My Application',

    /**
     * @var {string} the version of this application.
     */
    version: '1.0',

    /**
     * @var {string} the charset currently used for the application.
     */
    charset: 'UTF-8',

    /**
     * @var {string} the language that is meant to be used for end users.
     * @see sourceLanguage
     */
    language: 'en',

    /**
     * @var {string} the language that the application is written in. This mainly refers to
     * the language that the messages and view files are written in.
     * @see language
     */
    sourceLanguage: 'en',

    /**
     * @var {string|boolean} the layout that should be applied for views in this application. Defaults to 'main'.
     * If this is false, layout will be disabled.
     */
    layout: 'main',

    _baseConfig: {
        preload: [
            'logger'
        ],
        components: {
            logger: {
                className: 'Jii.components.Logger'
            },
            string: {
                className: 'Jii.components.String'
            },
            time: {
                className: 'Jii.components.Time'
            },
            urlManager: {
                className: 'Jii.controller.UrlManager'
            },
            viewManager: {
                className: Jii.isNode ? 'Jii.view.ServerWebViewManager' : 'Jii.view.ClientWebViewManager'
            }
        }
    },

    /**
     * @constructor
     */
    constructor: function(config) {
        Jii.app = this;

        // Merge with default config
        config = _.merge({}, this._baseConfig, config);

        this._preInit(config);
        //this._registerCoreComponents(config);

        this._super(null, null, config);
    },

    getUniqueId: function() {
        return '';
    },

    /**
     * Sets the root directory of the application and the @app alias.
     * This method can only be invoked at the beginning of the constructor.
     * @param {string} path the root directory of the application.
     */
    setBasePath: function(path) {
        this._super(path);
        Jii.setAlias('@app', this.getBasePath());
    },

    _preInit: function(config) {
        if (_.has(config, 'basePath')) {
            this.setBasePath(config.basePath);
            delete config.basePath;
        } else {
            throw new Jii.exceptions.InvalidConfigException('The `basePath` configuration is required.');
        }
    }

});
