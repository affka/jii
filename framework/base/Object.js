/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 *
 * @class Jii.base.Object
 * @extends Joints.Object
 */
Joints.defineClass('Jii.base.Object', Joints.Object, {

    /**
     * @param {object} [config]
     * @constructor
     */
    constructor: function(config) {
        this._super.apply(this, arguments);

        // Apply configuration to instance
        if (_.isObject(config)) {
            Jii.configure(this, config);
        }

        // Run custom init method
        this.init();
    },

    init: function() {
    },

    /**
     * Return full class name
     * @returns {string}
     */
    className: function() {
        return this.debugClassName;
    }

}, {

    /**
     * Return full class name
     * @returns {string}
     */
    className: function() {
        return this.debugClassName;
    }

});
