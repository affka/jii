module.exports = {
    components: {
        http: {
            className: 'Jii.controller.httpServer.HttpServer'
        },
        urlManager: {
            rules: {
                '/': 'site/index'
            }
        }
    }
};