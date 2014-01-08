/**
 * @copyright Pavel Koryagin, ExtPoint
 * @author Pavel Koryagin, pavel@koryagin.com
 * @license MIT
 */

/**
 * @class Joints.RelationalModel
 * @extends Backbone.Model
 */
Joints.defineClass('Joints.RelationalModel', Backbone.Model, {

    constructor: function(options) {

        // Construct
        this._super(options);

        // Enable relational storage logic
        if (this.constructor.collection) {
            this.constructor.collection.add(this);
        }
    },

    /**
     * @param {Backbone.Collection} foreignCollection
     * @param {String} foreignSecondaryKey
     */
    relation: function(foreignCollection, foreignSecondaryKey) {

        var where = {};
        where[foreignSecondaryKey] = this.get(this.idAttribute);

        return foreignCollection.where(where);
    },

    /**
     *
     * @param {Backbone.Collection} foreignCollection
     * @param {Function} filterFn
     * @returns {Joints.RelationalModel[]}
     */
    relationByFilter: function(foreignCollection, filterFn) {

        return foreignCollection.filter(filterFn.bind(this));
    }

}, {

    collection: null,

    setupCollection: function(data, options) {
        options = options || {};

        this.collection = new Joints.Collection(data, _.extend({}, options, { model: this }));
        return this.collection;
    }
});

