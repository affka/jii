/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var fs = require('fs');
var path = require('path');
/**
 * @class Jii.controller.actions.StaticAction
 * @extends Jii.controller.BaseAction
 */
var self = Joints.defineClass('Jii.controller.actions.StaticAction', Jii.controller.BaseAction, {

    rootPath: '@app/public',

    getMimeType: function (filePath) {
        var mimeTypes = {
            xhtml: 'text/html',
            htm: 'text/html',
            html: 'text/html',
            txt: 'text/plain',
            js: 'application/javascript',
            css: 'text/css',
            ics: 'text/calendar',
            csv: 'text/csv',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            bmp: 'image/bmp',
            ico: 'image/x-icon',
            tif: 'image/tiff',
            tiff: 'image/tiff',
            svg: 'image/svg+xml',
            mpe: 'video/mpeg',
            mpeg: 'video/mpeg',
            mpg: 'video/mpeg',
            xml: 'application/xml',
            rss: 'application/rss+xml',
            atom: 'application/atom+xml',
            yaml: 'application/x-yaml',
            ttf: 'application/x-font-ttf',
            otf: 'application/x-font-opentype',
            woff: 'application/font-woff',
            eot: 'application/vnd.ms-fontobject',
            map: 'application/json',
            json: 'application/json',
            pdf: 'application/pdf',
            zip: 'application/zip'
        };
        var extension = _.ltrim(path.extname(filePath), '.');
        return mimeTypes[extension] || 'text/plain';
    },

    run: function (request, response) {
        var filePath = Jii.getAlias(this.rootPath) + '/' + request.get('path');

        // Check file exists
        if (!fs.existsSync(filePath)) {
            Jii.app.logger.debug('Not found static file `%s`.', filePath);

            response.getHeaders().set('content-type', 'text/plain; charset=' + response.charset);
            response.setStatusCode(404);
            response.send();
            return;
        }

        response.format = Jii.controller.httpServer.Response.FORMAT_RAW;
        response.content = fs.readFileSync(filePath);
        response.getHeaders().set('content-type', this.getMimeType(filePath) + '; charset=' + response.charset);
        response.send();
    }

});
