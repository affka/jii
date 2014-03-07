require('./../../jii/main');
var config = require('./config');

Jii.init(config);

Jii.app.http.start();