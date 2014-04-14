/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.view.BaseViewManager
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.view.BaseViewManager', Jii.base.Component, {

    /**
     * @type {*} custom parameters that are shared among view templates.
     */
    params: [],

    /**
     * @var {object} a list of available renderers indexed by their corresponding supported file extensions.
     * Each renderer may be a view renderer object or the configuration for creating the renderer object.
     * For example, the following configuration enables both Smarty and Twig view renderers:
     *
     * ~~~
     * {
     *     tpl: {className: 'Jii.view.smarty.ViewRenderer'},
     *     twig: {className: 'Jii.view.twig.ViewRenderer'},
     * }
     * ~~~
     *
     * If no renderer is available for the given view file, the view file will be parsed by underscore _.template()
     */
    renderers: null,

    /**
     * @type {string} the default view file extension. This will be appended to view file names if they don't have file extensions.
     */
    defaultExtension: 'html',

    /**
     * @type {Jii.view.Theme|object} the theme object or the configuration array for creating the theme object.
     * If not set, it means theming is not enabled.
     */
    theme: null,

    /**
     * @type {Function[]}
     */
    _templates: [],

    init: function() {
        this._super();

        if (_.isObject(this.theme)) {
            if (!this.theme.className) {
                this.theme.className = 'Jii.view.Theme'
            }
            this.theme = Jii.createObject(this.theme);
        }
    },

    /**
     * Renders a view.
     *
     * The view to be rendered can be specified in one of the following formats:
     *
     * - path alias (e.g. "@app/views/site/index");
     * - absolute path within application (e.g. "//site/index"): the view name starts with double slashes.
     *   The actual view file will be looked for under the [[Application::viewPath|view path]] of the application.
     * - absolute path within current module (e.g. "/site/index"): the view name starts with a single slash.
     *   The actual view file will be looked for under the [[Module::viewPath|view path]] of [[module]].
     * - resolving any other format will be performed via [[ViewContext::findViewFile()]].
     *
     * @param {string} view    the view name. Please refer to [[Controller::findViewFile()]]
     *                                        and [[Widget::findViewFile()]] on how to specify this parameter.
     * @param {object} params  the parameters (name-value pairs) that will be extracted and made available in the view file.
     * @param {object} context the context that the view should use for rendering the view. If null,
     *                                        existing [[context]] will be used.
     * @return string                the rendering result
     * @throws InvalidParamException if the view cannot be resolved or the view file does not exist.
     * @see renderFile()
     */
    render: function(view, params, context) {
        params = params || {};
        context = context || null;

        var viewFile = this._findViewFile(view, context);
        return this.renderFile(viewFile, params, context);
    },

    /**
     * Finds the view file based on the given view name.
     * @param {string} view    the view name or the path alias of the view file. Please refer to [[render()]]
     *                                       on how to specify this parameter.
     * @param {object} [context] the context that the view should be used to search the view file. If null,
     *                                       existing [[context]] will be used.
     * @return string               the view file path. Note that the file may not exist.
     * @throws {Jii.exceptions.InvalidParamException} if [[context]] is required and invalid.
     */
    _findViewFile: function(view, context) {
        context = context || null;

        var file = null;

        if (view.substr(0, 1) === '@') {
            // e.g. "@app/views/main"
            file = Jii.getAlias(view);
        } else if (view.substr(0, 2) === '//') {
            // e.g. "//layouts/main"
            file = Jii.app.getViewPath() + '/' + _.ltrim(view, '/');
        } else if (view.substr(0, 1) === '/') {
            // e.g. "/site/index"
            /*if (Yii::$app->controller !== null) {
                $file = Yii::$app->controller->module->getViewPath() . DIRECTORY_SEPARATOR . ltrim($view, '/');
            } else {
                throw new InvalidCallException("Unable to locate view file for view '$view': no active controller.");
            }*/
        } else {
            // context required
            if (context === null) {
                context = this.context;
            }
            if (_.isObject(context) && _.isFunction(context.findViewFile)) {
                file = context.findViewFile(view);
            } else {
                throw new Jii.exceptions.InvalidParamException('Unable to locate view file for view `' + view + '`: no active view context.');
            }
        }

        if (self._extensionRegExp.test(file)) {
            return file;
        }
        return file + '.' + this.defaultExtension;
    },

    /**
     * Renders a view file.
     *
     * If [[theme]] is enabled (not null), it will try to render the themed version of the view file as long
     * as it is available.
     *
     * If [[renderer]] is enabled (not null), the method will use it to render the view file.
     * Otherwise, it will simply include the view file as a normal PHP file, capture its output and
     * return it as a string.
     *
     * @param {string} viewFile the view file. This can be either a file path or a path alias.
     * @param {object} params the parameters (name-value pairs) that will be extracted and made available in the view file.
     * @param {object} context the context that the view should use for rendering the view. If null,
     *                                         existing [[context]] will be used.
     * @return {string} the rendering result
     */
    renderFile: function(viewFile, params, context) {
        params = params || {};
        context = context || null;

        var output = '';
        //this._viewFiles[] = $viewFile;

        if (!this.beforeRender()) {
            return '';
        }

        //Yii::trace("Rendering view file: $viewFile", __METHOD__);

        var matches = self._extensionRegExp.exec(viewFile);
        var ext = matches !== null ? matches[1] : '';
        if (_.has(this.renderers, ext)) {
            // @todo Renderers
            /*if (is_array($this->renderers[$ext]) || is_string($this->renderers[$ext])) {
             $this->renderers[$ext] = Yii::createObject($this->renderers[$ext]);
             }*/
            /** @var ViewRenderer $renderer */
            //$renderer = $this->renderers[$ext];
            //$output = $renderer->render($this, $viewFile, $params);
        } else {
            output = this._getTemplate(viewFile).call(this, params);
        }

        this.afterRender(output);

        //array_pop($this->_viewFiles);
        return output;
    },

    getTemplate: function(path) {
        path = this._findViewFile(path);
        return this._getTemplate(path);
    },
    
    _getTemplate: function(path) {
        // @todo Need cache?
        //if (!_.has(this._templates, path)) {
            this._templates[path] = this._loadTemplateSync(path);
        //}
        return this._templates[path];
    },

    _loadTemplateSync: function(path) {
    },

    beforeRender: function() {
        return true;
    },

    afterRender: function(output) {
    }

}, {

    _extensionRegExp: /\.([a-z]+)$/

});
