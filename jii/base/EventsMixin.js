/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.base.EventsMixin
 */
if (typeof exports !== 'undefined') {
    Joints.defineMixin('Jii.base.EventsMixin', _.extend(require('events').EventEmitter.prototype, {
        domain: null,
        _events: null,
        _maxListeners: 10,

        trigger: function() {
            this.emit.apply(this, arguments);
        }
    }));
} else {
    Joints.defineMixin('Jii.base.EventsMixin', Backbone.Events);
}