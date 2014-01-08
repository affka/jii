/**
 * @copyright
 * @author
 * @license MIT
 */

/**
 * @class Joints.Events
 * @extends Backbone.Events
 */
if (typeof exports !== 'undefined') {
    //process.setMaxListeners(30);
    Joints.defineClass('Jii.base.Events', require('events').EventEmitter, {

    }, {
        inst: Joints.Object.inst
    });
} else {
    Joints.defineClass('Joints.Events', Backbone.Events, {

        constructor: function() {
            _.extend(this, Backbone.Events);
        }

    }, {
        inst: Joints.Object.inst
    });
}
