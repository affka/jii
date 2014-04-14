// Load libs
require('../../framework/require-server');

// Load tests app
require('./models/SampleModel');
require('./models/SampleRedisModel');
require('./models/FakeValidationModel');

Jii.init({
    basePath: __dirname,
    components: {
        redis: {
            className: 'Jii.components.Redis',
            host: '127.0.0.1',
            port: '6379'
        }
    }
});

Jii.app.redis.start();