/**
 * Jii - is a javascript framework based on php Yii Framework architecture.
 *
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii
 * @extends Joints.Object
 */
var self = Joints.defineClass('Jii', Joints.Object, {}, {

    /**
     * @type Jii.base.Application
     */
    app: null,

    /**
     * @type {object}
     */
    aliases: {
        '@jii': __dirname
    },

    /**
     * Running in node js
     * @type {boolean}
     */
    isNode: false,

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
            }
        }
    },

    init: function(config) {
        // Merge with default config
        config = config || {};
        config = _.merge({}, this._baseConfig, config);

        var components = config.components;
        delete config.components;

        var modules = config.modules;
        delete config.modules;

        // Create application
        this.app = new Jii.base.Application(config);

        this.app.setComponents(components || {});
        this.app.setModules(modules || {});
    },

    getVersion: function() {
        return '0.2';
    },

    /**
     * Translates a path alias into an actual path.
     *
     * The translation is done according to the following procedure:
     *
     * 1. If the given alias does not start with '@', it is returned back without change;
     * 2. Otherwise, look for the longest registered alias that matches the beginning part
     *    of the given alias. If it exists, replace the matching part of the given alias with
     *    the corresponding registered path.
     * 3. Throw an exception or return false, depending on the `$throwException` parameter.
     *
     * For example, by default '@jii' is registered as the alias to the Yii framework directory,
     * say '/path/to/yii'. The alias '@jii/web' would then be translated into '/path/to/yii/web'.
     *
     * If you have registered two aliases '@foo' and '@foo/bar'. Then translating '@foo/bar/config'
     * would replace the part '@foo/bar' (instead of '@foo') with the corresponding registered path.
     * This is because the longest alias takes precedence.
     *
     * However, if the alias to be translated is '@foo/barbar/config', then '@foo' will be replaced
     * instead of '@foo/bar', because '/' serves as the boundary character.
     *
     * Note, this method does not check if the returned path exists or not.
     *
     * @param {string} alias the alias to be translated.
     * @param {boolean} [throwException] whether to throw an exception if the given alias is invalid.
     * If this is false and an invalid alias is given, false will be returned by this method.
     * @return {string|boolean} the path corresponding to the alias, false if the root alias is not previously registered.
     * @throws {Jii.exceptions.InvalidParamException} if the alias is invalid while throwException is true.
     * @see setAlias()
     */
    getAlias: function(alias, throwException) {
        if (_.isUndefined(throwException)) {
            throwException = true;
        }

        if (alias.indexOf('@') !== 0) {
            return alias;
        }

        var index = alias.indexOf('/');
        var root = index === -1 ? alias : alias.substr(0, index);

        if (_.has(this.aliases, root)) {
            if (_.isString(this.aliases[root])) {
                return this.aliases[root] + (index !== -1 ? alias.substr(index) : '');
            }

            var finedPath = null;
            _.each(this.aliases[root], function(path, name) {
                var testAlias = alias + '/';
                if (testAlias.indexOf(name + '/') === 0) {
                    finedPath = path + alias.substr(name.length);
                    return false;
                }
            });
            if (finedPath !== null) {
                return finedPath;
            }
        }

        if (throwException) {
            throw new Jii.exceptions.InvalidParamException('Invalid path alias: ' + alias);
        }
        return false;
    },

    /**
     * Returns the root alias part of a given alias.
     * A root alias is an alias that has been registered via [[setAlias()]] previously.
     * If a given alias matches multiple root aliases, the longest one will be returned.
     * @param {string} alias the alias
     * @return {string|boolean} the root alias, or false if no root alias is found
     */
    getRootAlias: function(alias) {
        var index = alias.indexOf('/');
        var root = index === -1 ? alias : alias.substr(0, index);

        if (_.has(this.aliases, root)) {
            if (_.isString(this.aliases[root])) {
                return root;
            }

            var finedPath = null;
            _.each(this.aliases[root], function(path, name) {
                if (_.indexOf(alias + '/', name + '/') === 0) {
                    finedPath = name;
                    return false;
                }
            });
            if (finedPath !== null) {
                return finedPath;
            }
        }

        return false;
    },

    /**
     * Registers a path alias.
     *
     * A path alias is a short name representing a long path (a file path, a URL, etc.)
     * For example, we use '@jii' as the alias of the path to the Yii framework directory.
     *
     * A path alias must start with the character '@' so that it can be easily differentiated
     * from non-alias paths.
     *
     * Note that this method does not check if the given path exists or not. All it does is
     * to associate the alias with the path.
     *
     * Any trailing '/' and '\' characters in the given path will be trimmed.
     *
     * @param {string} alias the alias name (e.g. "@jii"). It must start with a '@' character.
     * It may contain the forward slash '/' which serves as boundary character when performing
     * alias translation by [[getAlias()]].
     * @param {string} path the path corresponding to the alias. Trailing '/' and '\' characters
     * will be trimmed. This can be
     *
     * - a directory or a file path (e.g. `/tmp`, `/tmp/main.txt`)
     * - a URL (e.g. `http://www.yiiframework.com`)
     * - a path alias (e.g. `@jii/base`). In this case, the path alias will be converted into the
     *   actual path first by calling [[getAlias()]].
     *
     * @throws {Jii.exceptions.InvalidParamException} if $path is an invalid alias.
     * @see getAlias()
     */
    setAlias: function(alias, path) {
        if (alias.indexOf('@') !== 0) {
            alias = '@' + alias;
        }

        var index = alias.indexOf('/');
        var root = index === -1 ? alias : alias.substr(0, index);

        if (path !== null) {
            path = alias.indexOf('@') !== 0 ? _.rtrim(path, '/') : this.getAlias(path);

            if (!_.has(this.aliases, root)) {
                if (index === -1) {
                    this.aliases[root] = path;
                } else {
                    this.aliases[root] = {};
                    this.aliases[root][alias] = path;
                }
            } else if (_.isString(this.aliases[root])) {
                if (index === -1) {
                    this.aliases[root] = path;
                } else {
                    var oldPath = this.aliases[root];
                    this.aliases[root] = {};
                    this.aliases[root][alias] = path;
                    this.aliases[root][root] = oldPath;
                }
            } else {
                this.aliases[root][alias] = path;
                //krsort(static::$aliases[$root]);
            }
        } else if (_.has(this.aliases, root)) {
            if (_.isObject(this.aliases[root])) {
                delete this.aliases[root][alias];
            } else if (index === -1) {
                delete this.aliases[root];
            }
        }
    },

    /**
     * Creates a new instance using the given configuration.
     * @param {string|object} config Class name or object with param `className`
     * @returns {Jii.base.Object}
     */
    createObject: function(config) {
        var className = null;

        // Normalize config
        if (_.isString(config)) {
            className = config;
            config = {};
        } else if (_.has(config, 'className')) {
            className = config.className;
            delete config.className;
        } else {
            throw new Jii.exceptions.ApplicationException('Wrong configuration for create object.');
        }

        // Get class
        var objectClass = Joints.namespace(className);
        if (!_.isFunction(objectClass)) {
            throw new Jii.exceptions.ApplicationException('Not found class `' + className + '` for create instance.');
        }

        // Arguments for constructor of class
        var args = [objectClass];
        args.concat(_.rest(arguments))
        if (!_.isEmpty(config)) {
            args.push(config);
        }

        // @todo Support old browsers (bind function)
        return new (objectClass.bind.apply(objectClass, args))();
    },

    /**
     *
     * @param {object} object Class instance
     * @param {object} config Configuration object {key: value, ..}
     */
    configure: function(object, config) {
        for (var key in config) {
            if (!config.hasOwnProperty(key)) {
                continue;
            }
            if (_.isUndefined(object[key]) || _.isFunction(object[key])) {
                continue;
            }

            object[key] = config[key];
        }
    },

    /**
     *
     * @param group
     * @param [message]
     * @returns {*}
     */
    t: function(group, message) {
        // @todo
        return message;
    }
});
