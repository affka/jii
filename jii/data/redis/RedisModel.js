/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.data.redis.RedisModel
 * @extends Jii.data.DataModel
 */
Joints.defineClass('Jii.data.redis.RedisModel', Jii.data.DataModel, {

    _index: null,

    schema: function () {
        return {};
    },

    getIndex: function () {
        return this._index;
    },

    _saveInternal: function () {
        var schema = this.static.getSchema();
        var schemaKey = schema.getKey(this.getAttributes());

        // Fill query params
        switch (schema.getFormat()) {
            case Jii.data.redis.CollectionSchema.FORMAT_STRING:
                return this.static.getRedis().createCommand('set', {
                    key: schemaKey,
                    value: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                    return reply === 'OK'
                });

            case Jii.data.redis.CollectionSchema.FORMAT_HASHES:
                return this.static.getRedis().createCommand('hset', {
                    key: schemaKey,
                    field: this.getPrimaryKey(),
                    value: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        return reply === 0 || reply === 1;
                    });

            case Jii.data.redis.CollectionSchema.FORMAT_LISTS:
                return this.static.getRedis().createCommand('rpush', {
                    key: schemaKey,
                    value: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        this._index = reply;
                        return reply !== null && reply > 0;
                    }.bind(this));

            case Jii.data.redis.CollectionSchema.FORMAT_SETS:
                if (!this.isNewRecord()) {
                    throw new Jii.Jii.exceptions.ApplicationException('Scheme format `SETS` supported only insert scenario.');
                }

                return this.static.getRedis().createCommand('sadd', {
                    key: schemaKey,
                    member: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        this._index = reply;
                        return reply === 0 || reply === 1;
                    }.bind(this));

            case Jii.data.redis.CollectionSchema.FORMAT_SORTED_SETS:
                if (!this.isNewRecord()) {
                    throw new Jii.Jii.exceptions.ApplicationException('Scheme format `SORTED_SETS` supported only insert scenario.');
                }
                if (scheme.scoreAttribute === null) {
                    throw new Jii.Jii.exceptions.ApplicationException('Param `scoreAttribute` must be set.');
                }

                return this.static.getRedis().createCommand('zadd', {
                    key: schemaKey,
                    score: this.get(scheme.scoreAttribute),
                    member: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        this._index = reply;
                        return reply === 0 || reply === 1;
                    }.bind(this));
        }

        throw new Jii.exceptions.ApplicationException('Format `' + schema.getFormat() + '` not supported in save() method.');
    },

    _deleteInternal: function () {
        var schema = this.static.getSchema();
        var schemaKey = schema.getKey(this.getAttributes());

        // Fill query params
        switch (schema.getFormat()) {
            case Jii.data.redis.CollectionSchema.FORMAT_STRING:
                return this.static.getRedis().createCommand('del', {
                    key: schemaKey
                }).execute().then(function (reply) {
                    return reply !== null && reply > 0;
                });

            case Jii.data.redis.CollectionSchema.FORMAT_HASHES:
                return this.static.getRedis().createCommand('hdel', {
                    key: schemaKey,
                    field: this.getPrimaryKey()
                }).execute().then(function (reply) {
                        return reply !== null && reply > 0;
                    });

            case Jii.data.redis.CollectionSchema.FORMAT_LISTS:
                return this.static.getRedis().createCommand('lrem', {
                    key: schemaKey,
                    count: -1,
                    value: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        return reply !== null && reply > 0;
                    });

            case Jii.data.redis.CollectionSchema.FORMAT_SETS:
                return this.static.getRedis().createCommand('srem', {
                    key: schemaKey,
                    member: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        return reply === 1;
                    });

            case Jii.data.redis.CollectionSchema.FORMAT_SORTED_SETS:
                return this.static.getRedis().createCommand('zrem', {
                    key: schemaKey,
                    member: JSON.stringify(this.getAttributes())
                }).execute().then(function (reply) {
                        return reply === 1;
                    });

        }

        throw new Jii.exceptions.ApplicationException('Format `' + schema.getFormat() + '` not supported in delete() method.');
    }

}, {

    _schema: null,

    createQuery: function () {
        return new Jii.data.redis.RedisQuery({
            modelClass: this
        });
    },

    /*createRelationQuery: function(config) {
     return new Jii.data.redis.RedisQuery(config);
     },*/

    findByPk: function (value) {
        return this.createQuery().findByPk(value);
    },

    getRedis: function () {
        return Jii.app.redis;
    },

    /**
     *
     * @return {Jii.data.redis.Schema}
     */
    getSchema: function () {
        if (this._schema === null) {
            this._schema = new Jii.data.redis.CollectionSchema(this.prototype.schema());
        }
        return this._schema;
    }

});
