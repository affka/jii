/**
 * @class tests.unit.models.SampleRedisModel
 * @extends Jii.base.Model
 */
var self = Joints.defineClass('tests.unit.models.SampleRedisModel', Jii.data.redis.RedisModel, {

    schema: function() {
        return {
            format: Jii.data.redis.CollectionSchema.FORMAT_HASHES,
            key: 'sample',
            columns: [
                'uid',
                'name',
                'description'
            ]
        };
    },

    rules: function () {
        return [
            // insert
            ['name', 'required', {on: 'insert'}],
            ['uid', 'default', {on: 'insert', value: Jii.app.string.generateUid()}],

            // insert, update
            ['description', 'string', {on: ['insert', 'update'], max: 10}]
        ];
    }

});