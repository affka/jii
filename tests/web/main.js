require('./../../jii/require-server');
require('./controllers/SiteController');

Jii.debug = true;
Jii.init({
    components: {
        http: {
            className: 'Jii.controller.httpServer.HttpServer'
        },
        comet: {
            className: 'Jii.controller.cometServer.CometServer',
            hubEngine: false
        },
        urlManager: {
            rules: {
                '': 'site/index'
            }
        }
    }
});

Jii.app.http.start();
Jii.app.comet.start();
