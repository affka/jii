/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.app.Module
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.base.Module', Jii.base.Component, {

    actionNamespace: null,

    _baseConfig: {
        preload: [],
        components: {},
        modules: {}
    },

    /**
     * Create components, modules and set configuration to module
     * @param {object} config
     */
    setConfiguration: function(config) {
        // Merge with defaults
        config = _.extend({}, this._baseConfig, config);

        // Preload components
        _.each(config.preload, _.bind(function(id) {
            // Check configuration exists
            if (!config.components[id]) {
                throw new Jii.exceptions.ApplicationException('Not find configuration for preload component `' + id + '`.');
            }

            this.setComponent(config.components[id], id);
        }, this));
        delete config.preload;

        // All components
        _.each(config.components, _.bind(this.setComponent, this));
        delete config.components;

        // Modules
        _.each(config.modules, _.bind(this.setModule, this));
        delete config.modules;

        // Add simple params to application
        this._super(config);
    },

    /**
     * Create component and save it in module.
     * You can get component with id `test` as Jii.app.test.
     * @param {object} config
     * @param {string} id
     */
    setComponent: function(config, id) {
        // Skip, if already initialized
        if (_.has(this, id)) {
            return;
        }

        // Get component class
        var componentClass = this._getClassByConfig(config, id);

        // Create instance and set configuration
        this[id] = new componentClass();
        this[id].setConfiguration(config);
        this[id].init();
    },

    /**
     * Create module and save it in module. Module id sets as id + `Module` suffix.
     * You can get module with id `test` as Jii.app.testModule.
     * @param {object} config
     * @param {string} id
     */
    setModule: function(config, id) {
        id = this._normalizeModuleId(id);
        this.setComponent(config, id);
    },

    getModule: function(id) {
        id = this._normalizeModuleId(id);
        return this[id] || null;
    },

    /**
     * Add suffix after module name
     * @param {string} id
     * @return {string}
     * @private
     */
    _normalizeModuleId: function(id) {
        return id + 'Module';
    },

    /**
     * Get class by param `className` from config and check class exists.
     * @param {object} config
     * @param {string} id
     * @returns {*}
     * @private
     */
    _getClassByConfig: function(config, id) {
        // Check params `className` exists
        if (!config.className) {
            throw new Jii.exceptions.ApplicationException('Not find param `className` in configuration of component `' + id + '`.');
        }

        // Check class exists
        var componentClass = Joints.namespace(config.className);
        if (componentClass.debugClassName !== config.className) { // @todo
            throw new Jii.exceptions.ApplicationException('Not find component `' + config.className + '` or it is not component.');
        }

        return componentClass;
    }

});
