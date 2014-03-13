/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.base.action.BaseAction
 * @extends Jii.base.Object
 */
var self = Joints.defineClass('Jii.base.action.BaseAction', Jii.base.Object, {

    /**
     * @type {Jii.components.router.BaseRouter}
     */
    owner: null,

    /**
     * @type {object}
     */
    params: {},

    /**
     * @type {Joints.Deferred|null}
     */
    deferred: null,

    accessFilter: function() {
        return {};
    },

    init: function() {
    },

    run: function() {
    },

    /**
     *
     * @returns {boolean|Joints.Deferred}
     */
    checkCanAccess: function() {
        var canAccess = true;
        var deferred = new Joints.Deferred();
        var accessFilter = this.accessFilter();

        // Check required fields
        if (canAccess && accessFilter && _.isArray(accessFilter.required)) {
            _.each(accessFilter.required, _.bind(function(key) {
                if (!_.has(this.params, key)) {
                    Jii.app.logger.warning('Not find required param `%s` in action `%s`.', key, this.debugClassName);
                    canAccess = false;
                    return false;
                }
            }, this));
        }

        deferred.resolve(canAccess);

        return deferred;
    }

});
