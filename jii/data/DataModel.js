/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @abstract
     * @class Jii.data.DataModel
     * @extends Jii.base.Model
     */
    Joints.defineClass('Jii.data.DataModel', Jii.base.Model, {

        _related: {},
        _oldAttributes: null,

        constructor: function () {
            this._related = _.clone(this._related);
            this._super.apply(this, arguments);
        },

        init: function() {
            this.setScenario('insert');
        },

        get: function(name) {
            if (_.has(this._related, name)) {
                return this._related[name];
            }

            return this._super.apply(this, arguments);
        },

        set: function() {
            // @todo add set relation
            this._super.apply(this, arguments);
        },

        isNewRecord: function() {
            return this._oldAttributes === null;
        },

        /**
         *
         * @param {Boolean} [runValidation]
         * @returns {Joints.Deferred}
         */
        save: function (runValidation) {
            if (!_.isBoolean(runValidation)) {
                runValidation = true;
            }

            // Validation
            var validateDeferred = runValidation ?
                this.validate() :
                true;
            var isInsert = this.isNewRecord();
            var isSuccess = false;

            return Joints.when(validateDeferred).then(function (isValidate) {
                    if (!isValidate) {
                        return false;
                    }

                    // Run before event
                    return this.beforeSave(isInsert);
                }.bind(this)).then(function (bool) {
                    if (!bool) {
                        return false;
                    }

                    // Save data
                    return this._saveInternal();
                }.bind(this)).then(function (success) {
                    isSuccess = success;

                    // Reset changes
                    if (isSuccess) {
                        this._oldAttributes = _.clone(this._attributes);
                    }

                    // Run after event
                    return this.afterSave(isInsert);
                }.bind(this)).then(function () {
                    if (isSuccess) {
                        this.static.inst().trigger('afterSave', this);
                        this.setScenario('update');
                    }

                    // Return result
                    return isSuccess;
                }.bind(this));
        },

        delete: function () {
            var isSuccess = false;

            // Run before event
            return this.beforeDelete().then(function (bool) {
                    if (!bool) {
                        return false;
                    }

                    // Delete data
                    return this._deleteInternal();
                }.bind(this)).then(function (success) {
                    isSuccess = success;

                    // Run after event
                    return this.afterDelete();
                }.bind(this)).then(function () {
                    if (isSuccess) {
                        this.static.inst().trigger('afterDelete', this);
                    }

                    // Return result
                    return isSuccess;
                }.bind(this));
        },

        beforeSave: function (isInsert) {
            return new Joints.Deferred().resolve(true);
        },

        afterSave: function (isInsert) {
            return new Joints.Deferred().resolve();
        },

        beforeDelete: function () {
            return new Joints.Deferred().resolve(true);
        },

        afterDelete: function () {
            return new Joints.Deferred().resolve();
        },

        /*hasOne: function(modelClass, link) {
            return self.createRelationQuery({
                modelClass: modelClass,
                link: link,
                primaryModel: this,
                multiple: false
            });
        },

        hasMany: function(modelClass, link) {
            return self.createRelationQuery({
                modelClass: modelClass,
                link: link,
                primaryModel: this,
                multiple: false
            });
        },*/

        getRelation: function(name) {
            var method = 'get' + name.charAt(0).toUpperCase() + name.slice(1);
            if (!_.isFunction(this[method])) {
                throw new Jii.exceptions.ApplicationException('Model `' + this.debugClassName + '` has not relation `' + name + '`.');
            }

            return this[method].call(this);
        },

        populateRelation: function(name, records) {
            this._related[name] = records;
        },

        isRelationPopulated: function(name) {
            return _.has(this._related, name);
        },

        getPopulatedRelations: function() {
            return this._related;
        },

        getPrimaryKey: function() {
            var key = this.static.primaryKey();
            return key ? this.get(key) : null;
        },

        /**
         * Get key-value object with model attributes
         * @return {Array}
         */
        attributes: function() {
            return this.static.getSchema().getColumnNames();
        },

        /**
         *
         * @param {String} name
         * @returns {boolean}
         */
        hasAttribute: function(name) {
            return this._super(name) || _.has(this.static.getSchema().columns, name);
        },

        /**
         *
         * @param name
         * @returns {boolean}
         */
        isAttributeChanged: function(name) {
            return this._oldAttributes !== null &&
                _.has(this._oldAttributes, name) &&
                _.has(this._attributes, name) &&
                this._oldAttributes[name] !== this._attributes[name];
        },

        getDirtyAttributes: function(names) {
            // @todo
            return this._oldAttributes || this._attributes;
        },

        afterFind: function() {
        }

    }, {

        /**
         *
         * @param {Object} row
         * @returns {this}
         */
        instantiate: function(row) {
            return new this();
        },

        /**
         *
         * @param {Object} row
         * @returns {this}
         */
        create: function(row) {
            var model = this.instantiate(row);
            model.setAttributes(row, false);
            model.setScenario('update');
            model._oldAttributes = _.clone(model._attributes);
            model.afterFind();

            return model;
        },

        /**
         * @returns {Jii.data.Query}
         */
        createQuery: function() {
            throw new Jii.exceptions.ApplicationException('Not found implementation for method `createQuery()`.');
        },

        /**
         * @returns {Jii.data.Query}
         */
        /*createRelationQuery: function() {
            throw new Jii.exceptions.ApplicationException('Not found implementation for method `createRelationQuery()`.');
        },*/

        /**
         *
         * @param {*} condition
         * @returns {Jii.data.Query} Return query object
         */
        find: function(condition) {
            var queryObject = this.createQuery();

            // Find by pk
            if (condition && !_.isArray(condition)) {
                return queryObject.findByPk(condition);
            }

            // Find by other (where/params) condition
            if (_.isArray(condition)) {
                return queryObject.where(condition);
            }

            return queryObject;
        },

        /**
         * Returns the primary key
         * @returns {string|null}
         */
        primaryKey: function() {
            return this.getSchema().primaryKey;
        },

        /**
         *
         * @return {Jii.data.schema.Schema}
         */
        getSchema: function() {
        }

    });

})();