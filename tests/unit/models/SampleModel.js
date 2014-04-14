/**
 * @class tests.unit.models.SampleModel
 * @extends Jii.base.Model
 */
var self = Joints.defineClass('tests.unit.models.SampleModel', Jii.base.Model, {

    _attributes: {
        uid: null,
        name: null,
        description: null
    },

    rules: function () {
        return [
            // insert
            ['name', 'required', {on: 'insert'}],

            // insert, update
            ['description', 'string', {on: ['insert', 'update'], max: 10}]
        ];
    }

});