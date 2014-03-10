require('./bootstrap');

/**
 * @class tests.unit.JiiBaseTest
 * @extends Jii.base.UnitTest
 */
var self = Joints.defineClass('tests.unit.JiiBaseTest', Jii.base.UnitTest, {

    aliasesTest: function (test) {
        var YII_PATH = 'qwe';
        test.strictEqual(YII_PATH, Jii.getAlias('@yii'));

        Jii.aliases = {};
        test.strictEqual(Jii.getAlias('@yii', false), false);

        Jii.setAlias('@yii', '/yii/framework');
        test.strictEqual(Jii.getAlias('@yii'), '/yii/framework');
        test.strictEqual(Jii.getAlias('@yii/test/file'), '/yii/framework/test/file');

        Jii.setAlias('@yii/gii', '/yii/gii');
        test.strictEqual(Jii.getAlias('@yii'), '/yii/framework');
        test.strictEqual(Jii.getAlias('@yii/test/file'), '/yii/framework/test/file');
        test.strictEqual(Jii.getAlias('@yii/gii'), '/yii/gii');
        test.strictEqual(Jii.getAlias('@yii/gii/file'), '/yii/gii/file');

        Jii.setAlias('@tii', '@yii/test');
        test.strictEqual(Jii.getAlias('@tii'), '/yii/framework/test');

        Jii.setAlias('@yii', null);
        test.strictEqual(Jii.getAlias('@yii', false), false);
        test.strictEqual(Jii.getAlias('@yii/gii/file'), '/yii/gii/file');

        Jii.setAlias('@some/alias', '/www');
        test.strictEqual(Jii.getAlias('@some/alias'), '/www');
        
        test.done();
    }

});

module.exports = new self().exports();
