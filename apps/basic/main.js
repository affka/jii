require('./../../framework/require-server');
require('./controllers/SiteController');

Jii.init({
    basePath: __dirname,
    components: {
        http: {
            className: 'Jii.controller.httpServer.HttpServer'
        },
        urlManager: {
            rules: {
                '': 'site/index',
                '<path:.+\\.[a-z]{2,5}$>': 'site/static',
                '<action>': 'site/<action>'
            }
        }
    }
});

Jii.app.http.start();
