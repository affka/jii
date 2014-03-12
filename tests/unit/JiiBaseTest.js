require('./bootstrap');

/**
 * @class tests.unit.JiiBaseTest
 * @extends Jii.base.UnitTest
 */
var self = Joints.defineClass('tests.unit.JiiBaseTest', Jii.base.UnitTest, {

    aliasesTest: function (test) {
        var jiiPath = require('fs').realpathSync(__dirname + '/../../jii');
        test.strictEqual(jiiPath, Jii.getAlias('@jii'));

        Jii.aliases = {};
        test.strictEqual(Jii.getAlias('@jii', false), false);

        Jii.setAlias('@jii', '/yii/framework');
        test.strictEqual(Jii.getAlias('@jii'), '/yii/framework');
        test.strictEqual(Jii.getAlias('@jii/test/file'), '/yii/framework/test/file');

        Jii.setAlias('@jii/gii', '/yii/gii');
        test.strictEqual(Jii.getAlias('@jii'), '/yii/framework');
        test.strictEqual(Jii.getAlias('@jii/test/file'), '/yii/framework/test/file');
        test.strictEqual(Jii.getAlias('@jii/gii'), '/yii/gii');
        test.strictEqual(Jii.getAlias('@jii/gii/file'), '/yii/gii/file');

        Jii.setAlias('@tii', '@jii/test');
        test.strictEqual(Jii.getAlias('@tii'), '/yii/framework/test');

        Jii.setAlias('@jii', null);
        test.strictEqual(Jii.getAlias('@jii', false), false);
        test.strictEqual(Jii.getAlias('@jii/gii/file'), '/yii/gii/file');

        Jii.setAlias('@some/alias', '/www');
        test.strictEqual(Jii.getAlias('@some/alias'), '/www');
        
        test.done();
    }

});

module.exports = new self().exports();
