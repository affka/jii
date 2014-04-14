require('./../../../framework/require-server');
require('./require-server');

Jii.init({
    basePath: __dirname + '/..',
    controllerNamespace: 'app.server.controllers',
    components: {
        http: {
            className: 'Jii.controller.httpServer.HttpServer'
        },
        comet: {
            className: 'Jii.controller.cometServer.CometServer'
        },
        urlManager: {
            rules: {
                '<action>': 'site/<action>',
                '<path:.+\\.[a-z]{2,5}$>': 'site/static',
                '<path:.*>': 'site/index'
            }
        }
    }
});

Jii.app.http.start();
Jii.app.comet.start();
