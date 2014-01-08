/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.base.Component
 * @extends Joints.Events
 */
var self = Joints.defineClass('Jii.base.Component', Joints.Events, {

    className: null,

    init: function() {

    },

    setConfiguration: function(params) {
        _.each(params || {}, _.bind(function(value, key) {
            if (_.isUndefined(this[key])) {
                throw new Jii.exceptions.ApplicationException('Not find param `' + key + '` in component `' + this.debugClassName + '`.');
            }

            if (_.isFunction(this[key])) {
                throw new Jii.exceptions.ApplicationException('Cannot replace component method `' + key + '` in component `' + this.debugClassName + '`.');
            }

            // Check model
            var classNameKey = key + 'ClassName';
            var modelClassName = params[classNameKey] || this[classNameKey];
            if (modelClassName) {
                // Check class exists
                var modelClass = Joints.namespace(modelClassName);
                if (!modelClass) {
                    throw new Jii.exceptions.ApplicationException('Not find model class name `' + modelClassName + '` in relation `' + key + '`.');
                }

                // Create model instance, if it no exists
                if (this[key] instanceof modelClass === false) {
                    this[key] = new modelClass();
                }

                // Set model attributes
                this[key].setAttributes(value);
                return;
            }

            this[key] = value;
        }, this));
    }

});
