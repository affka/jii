require('./bootstrap');

/**
 * @class tests.unit.ModelTest
 * @extends Jii.base.UnitTest
 */
var self = Joints.defineClass('tests.unit.ModelTest', Jii.base.UnitTest, {

    _getModelInstances: function () {
        return [
            new tests.unit.models.SampleModel(),
            new tests.unit.models.SampleRedisModel()
        ];
    },

    setterTest: function (test) {
        _.each(this._getModelInstances(), function (sampleModel) {
            // Check insert scenario (set name and description)
            sampleModel.setScenario('insert');
            sampleModel.setAttributes({
                name: 'Ivan',
                description: 'Developer'
            });
            test.strictEqual(sampleModel.get('name'), 'Ivan');
            test.strictEqual(sampleModel.get('description'), 'Developer');

            // Check update scenario (can only set description)
            sampleModel.setScenario('update');
            sampleModel.setAttributes({
                name: 'John',
                description: 'Project manager'
            });
            test.strictEqual(sampleModel.get('name'), 'Ivan');
            test.strictEqual(sampleModel.get('description'), 'Project manager');

            // Check try set unknow attribute
            test.throws(function () {
                sampleModel.set('unknow', '...');
            }, Jii.exceptions.ApplicationException);
        });

        test.done();
    },

    /*eventsTest: function(test) {
     var eventData = {};

     var sampleModel = new tests.unit.models.SampleModel();
     sampleModel.on('change', function(model) {
     eventData.change = {
     model: model
     }
     });
     sampleModel.on('change:name', function(model, value) {
     eventData.changeName = {
     model: model,
     value: value
     }
     });

     sampleModel.set('name', 'John');
     test.strictEqual(eventData.change.model, sampleModel);
     test.strictEqual(eventData.changeName.model, sampleModel);
     test.strictEqual(eventData.changeName.value, 'John');

     test.done();
     }*/

    validateTest: function (test) {
        _.each(this._getModelInstances(), function (sampleModel) {
            sampleModel.setScenario('insert');
            sampleModel.set('description', '1234567890+1');
            sampleModel.validate().done(function (isValid) {
                // Check validation errors
                test.strictEqual(isValid, false);
                test.strictEqual(sampleModel.hasErrors(), true);
                test.strictEqual(_.keys(sampleModel.getErrors()).length, 2);
                test.strictEqual(sampleModel.getErrors().name.length, 1); // Required error
                test.strictEqual(sampleModel.getErrors().description.length, 1); // Length error

                // Add custom error
                sampleModel.addError('uid', 'Error text..');
                sampleModel.addError('name', 'Error text..');
                test.strictEqual(_.keys(sampleModel.getErrors()).length, 3);
                test.strictEqual(sampleModel.getErrors().name.length, 2);

                // Clear errors
                sampleModel.clearErrors();
                test.strictEqual(_.keys(sampleModel.getErrors()).length, 0);
            });
        });

        test.done();
    },

    redisCrudTest: function (test) {
        var sampleModel = new tests.unit.models.SampleRedisModel();
        sampleModel.setAttributes({
            name: 'John'
        });

        test.strictEqual(sampleModel.isNewRecord(), true);
        test.strictEqual(sampleModel.getScenario(), 'insert');

        sampleModel.save().then(function (success) {
            test.strictEqual(success, true);
            test.notStrictEqual(sampleModel.getPrimaryKey(), null);

            test.strictEqual(sampleModel.isNewRecord(), false);
            test.strictEqual(sampleModel.getScenario(), 'update');

            // Change name
            sampleModel.set('name', 'Ivan');
            test.strictEqual(sampleModel.isAttributeChanged('name'), true);

            return sampleModel.save();
        }).then(function (success) {
            test.strictEqual(success, true);

                // Check find by uid
                return tests.unit.models.SampleRedisModel.find(sampleModel.getPrimaryKey()).one();
            }).then(function (finedModel) {
                test.notStrictEqual(finedModel, null);
                test.strictEqual(finedModel.getPrimaryKey(), sampleModel.getPrimaryKey());
                test.strictEqual(finedModel.get('name'), 'Ivan');
                test.strictEqual(finedModel.isNewRecord(), false);
                test.strictEqual(finedModel.getScenario(), 'update');

                // Remove model
                return sampleModel.delete();
            }).then(function (success) {
                test.strictEqual(success, true);

                // Check deleted
                return tests.unit.models.SampleRedisModel.find(sampleModel.getPrimaryKey()).one();
            }).then(function (finedModel) {
                test.strictEqual(finedModel, null);

                test.done();
            });
    },

    redisQueryTest: function(test) {
        var sampleModel = new tests.unit.models.SampleRedisModel();
        sampleModel.setAttributes({
            name: 'Alex'
        });

        sampleModel.save().then(function (success) {
            test.strictEqual(success, true);

                // Find as object
                return tests.unit.models.SampleRedisModel.find(sampleModel.getPrimaryKey()).asObject().one();
            }).then(function (finedData) {
                test.notStrictEqual(finedData, null);
                test.strictEqual(finedData.uid, sampleModel.getPrimaryKey());
                test.strictEqual(finedData.name, 'Alex');

                test.done();
            });
    }

});

module.exports = new self().exports();
