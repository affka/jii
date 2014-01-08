/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */
(function () {

    // Available commands list from http://redis.io/commands.json
    var commands = require('./commands.json');

    /**
     * @class Jii.data.redis.RedisQuery
     * @extends Jii.data.Query
     */
    var self = Joints.defineClass('Jii.data.redis.RedisQuery', Jii.data.Query, {

        method: null,
        key: null,
        score: null,
        member: null,
        field: null,
        value: null,
        start: null,
        stop: null,
        limit: null,

        /**
         *
         * @param {String|Integer} value
         * @returns {Jii.data.redis.RedisQuery}
         */
        findByPk: function (value) {
            var schema = this.modelClass.getSchema();

            switch (schema.getFormat()) {
                case Jii.data.redis.CollectionSchema.FORMAT_HASHES:
                    this.method = 'hget';
                    this.key = schema.getKey();
                    this.field = value;
                    break;

                default:
                    throw new Jii.exceptions.ApplicationException('Not found schema format `' + schema.getFormat() + '` for findByPk() in redis query.');
            }

            return this;
        },

        /**
         * @param {Object} params
         * @returns {Jii.data.redis.RedisQuery}
         */
        where: function (params) {
            _.extend(this, params);
            return this;
        },

        /**
         *
         * @param {Jii.components.Redis} [connection]
         * @returns {Joints.Deferred}
         */
        one: function (connection) {
            var deferred = new Joints.Deferred();
            this._multiple = false;

            this._filterByVia().then(function (success) {
                    if (!success) {
                        deferred.resolve(null);
                        return;
                    }

                    return this.createCommand(connection).execute();
                }.bind(this)).done(function (reply) {
                    if (!reply) {
                        deferred.resolve(null);
                        return;
                    }

                    var model = this._buildItem(reply);

                    if (this._with) {
                        this.findWith(this._with, [model]).done(function() {
                            deferred.resolve(model);
                        });
                    } else {
                        deferred.resolve(model);
                    }
                }.bind(this));

            return deferred.promise();
        },

        /**
         *
         * @param {Jii.components.Redis} [connection]
         * @returns {Joints.Deferred}
         */
        all: function (connection) {
            var deferred = new Joints.Deferred();
            this._multiple = true;

            this._filterByVia().then(function (success) {
                    if (!success) {
                        deferred.resolve([]);
                        return;
                    }

                    return this.createCommand(connection).execute();
                }.bind(this)).done(function (reply) {
                    if (!reply || !_.isArray(reply)) {
                        deferred.resolve([]);
                        return;
                    }

                    var models = _.map(reply, this._buildItem.bind(this));

                    if (this._with) {
                        this.findWith(this._with, models).done(function() {
                            deferred.resolve(models);
                        });
                    } else {
                        deferred.resolve(models);
                    }
                }.bind(this));

            return deferred.promise();
        },

        findWith: function(relationNames, models) {
            var deferreds = [];

            _.each(relationNames, function(params, name) {
                _.each(models, function(model) {
                    var relationQuery = model instanceof Jii.data.DataModel ?
                        model.getRelation(name) :
                        this.modelClass.create(model).getRelation(name); // @todo cache this

                    if (params.child.length > 0) {
                        relationQuery.with(params.child);
                    }

                    if (this._asObject === true) {
                        relationQuery.asObject();
                    }

                    var relationDeferred = relationQuery._multiple !== true ?
                        relationQuery.one() :
                        relationQuery.all();

                    relationDeferred.then(function(relationModels) {
                        if (model instanceof Jii.data.DataModel) {
                            model.populateRelation(name, relationModels);
                        } else {
                            model[name] = relationModels;
                        }

                        // @todo callback
                    }.bind(this));

                    deferreds.push(relationDeferred);
                }.bind(this));
            }.bind(this));

            if (deferreds.length === 0) {
                return new Joints.Deferred().resolve();
            }

            return Joints.when.apply(this, deferreds);
        },

        _buildItem: function(data) {
            if (_.isString(data) && data.substr(0, 1) === '{') {
                data = JSON.parse(data);
            }

            if (this._asObject) {
                return data;
            }

            return this.modelClass.create(data);
        },

        /**
         *
         * @param [connection]
         * @returns {*}
         */
        execute: function (connection) {
            return this.createCommand(connection).execute();
        },

        /**
         *
         * @param {Jii.components.Redis} [connection]
         * @returns {Jii.data.redis.Command}
         */
        createCommand: function (connection) {
            var command = new Jii.data.redis.Command();
            command.connection = connection || this.modelClass.getRedis();
            command.method = this.method;
            command.attributes = this; //_.pick(this, ['key', 'start', 'stop', 'limit'])
            return command;
        },

        _filterByVia: function () {
            var deferred = new Joints.Deferred();

            if (this._via === null) {
                deferred.resolve(true);
                return deferred.promise();
            }

            var schema = this.modelClass.getSchema();
            if (!schema.isSupportedVia()) {
                throw new Jii.exceptions.ApplicationException('Schema format `' + schema.getFormat() + '` not supported query with via()');
            }

            if (this._via instanceof Jii.data.Query) {
                var viaQueryDeferred = this._multiple ?
                    this._via.asObject().all() :
                    this._via.asObject().one();

                viaQueryDeferred.done(function (reply) {
                    var isExists = this._multiple ?
                        _.isArray(reply) && reply.length > 0 :
                        _.isString(reply);

                    if (!isExists) {
                        // Not found
                        deferred.resolve(false);
                        return;
                    }

                    // Check is model
                    // @todo

                    // Build query
                    this.method = this._multiple ? 'hmget' : 'hget';
                    this.key = this.modelClass.getSchema().getKey();
                    this.field = reply;

                    deferred.resolve(true);
                }.bind(this));
            } /*else if (_.isObject(this._via)) {

                deferred.resolve()
            } */else if (_.isArray(this._via)) {
                if (this._via.length === 0) {
                    // Not found
                    deferred.resolve(false);
                } else if (this._via[0] instanceof Jii.data.DataModel) {
                    // is models[]

                } else if (_.isObject(this._via[0])) {
                    // is data[]

                } else if (this._via[0]) {
                    // is pk[]

                    // Build query
                    this.method = this._multiple ? 'hmget' : 'hget';
                    this.key = this.modelClass.getSchema().getKey();
                    this.field = this._via;

                    deferred.resolve(true);
                }

            }
            return deferred.promise();
        },

        _filterByModels: function(modelsData) {

        }

    });

})();