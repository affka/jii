// Load libs
require('../../jii/main');

// Load tests app
require('./models/SampleModel');
require('./models/SampleRedisModel');
require('./models/FakeValidationModel');

Jii.init({
    components: {
        redis: {
            className: 'Jii.components.Redis',
            host: '127.0.0.1',
            port: '6379'
        }
    }
});

Jii.app.redis.start();