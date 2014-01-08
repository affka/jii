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
            }
        }
    },

    init: function(config) {
        // Merge with default config
        config = config || {};
        config = _.merge({}, this._baseConfig, config);

        // Create application
        this.app = new Jii.base.Application();
        this.app.setConfiguration(config);
    },

    /**
     * Creates a new instance using the given configuration.
     * @param {String|Object} config Class name or object with param `className`
     * @returns {Jii.base.Object}
     */
    createObject: function(config) {
        var className = null;

        if (_.isString(config)) {
            className = config;
            config = {};
        } else if (_.has(config, 'className')) {
            className = config.className;
            delete config.className;
        } else {
            throw new Jii.exceptions.ApplicationException('Wrong configuration for create object.');
        }

        var objectClass = Joints.namespace(className);

        if (!_.isFunction(objectClass)) {
            throw new Jii.exceptions.ApplicationException('Not found class `' + className + '` for create instance.');
        }

        return _.isEmpty(config) ? new objectClass() : new objectClass(config);
    },

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
