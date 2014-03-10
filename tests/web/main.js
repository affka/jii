require('./../../jii/main');
require('./controllers/SiteController');
var config = require('./config');

Jii.debug = true;
Jii.init(config);

Jii.app.http.start();
