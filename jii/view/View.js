/**
 * @copyright Pavel Koryagin, ExtPoint
 * @author Pavel Koryagin, pavel@koryagin.com
 * @license MIT
 */

/**
 * @class Jii.view.View
 * @extends Jii.base.Object
 */
var self = Joints.defineClass('Jii.view.View', Jii.base.Object, {

    /**
     * Unique view id
     * @type {string}
     */
    cid: null,

    /**
     * Root view jQuery element
     * @type {jQuery}
     */
    $el: null,

    /**
     * Element which joints this view to end
     * @type {jQuery}
     */
    appendTo: null,

    /**
     * Element which joints this view to begin
     * @type {jQuery}
     */
    prependTo: null,

    /**
     * Element which replaced by this view
     * @type {jQuery}
     */
    replaceThis: null,

    /**
     * Initialize with string or _.template.
     * Strings will be turned into _.template during construction.
     * @type {string|Function}
     */
    template: '<div></div>',

    /**
     * Bind callbacks to dom events. Callbacks will be bound to the view,
     * with `this` set properly. Format:
     *   {
     *     'event selector' : 'callback',
     *
     *     'mousedown .title':  'edit',
     *     'click .button':     'save',
     *     'click .open':       function(e) { ... }
     *   }
     *
     * @type {{string: string|function}}
     */
    events: null,

    /**
     * Custom view options
     * @type {object}
     */
    options: null,

    /**
     * Method run after template rendered
     * @type {function}
     */
    onRender: Joints.noop,

    /**
     * Override this to set elements' sizes
     * @type {function}
     */
    doLayout: Joints.noop,

    /**
     * Override this to create children
     * @type {function}
     */
    createChildren: Joints.noop,

    constructor: function (config) {
        config = config || {};

        // Apply config to this
        this._super(config);

        // Generate unique view id
        this.cid = _.uniqueId('view');

        // Run custom init method
        this.init();

        // Run internal render
        var template = this._compileTemplate();
        this._initializeDom(template);
        this._insertDom();

        //this.delegateEvents();

        // Run custom rendering
        this.onRender();

        // Create children after render and initialization
        this.createChildren();

        // Apply size on initialization
        this.doLayout();
    },

    /**
     * jQuery delegate for element lookup, scoped to DOM elements within the current view.
     * @param {string} selector
     * @returns {jQuery}
     */
    $: function (selector) {
        return this.$el.find(selector);
    },

    /**
     * Data which appended to template
     * @returns {object}
     */
    getTemplateData: function () {
        return {};
    },

    /**
     * @returns {*}
     */
    remove: function () {
        this.$el.remove();
        //this.stopListening();
        return this;
    },

    //
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    /*delegateEvents: function(events) {
     if (!(events || (events = _.result(this, 'events')))) return this;
     this.undelegateEvents();
     for (var key in events) {
     var method = events[key];
     if (!_.isFunction(method)) method = this[events[key]];
     if (!method) continue;

     var match = key.match(delegateEventSplitter);
     var eventName = match[1], selector = match[2];
     method = _.bind(method, this);
     eventName += '.delegateEvents' + this.cid;
     if (selector === '') {
     this.$el.on(eventName, method);
     } else {
     this.$el.on(eventName, selector, method);
     }
     }
     return this;
     },*/

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    /*undelegateEvents: function() {
     this.$el.off('.delegateEvents' + this.cid);
     return this;
     },*/

    /**
     * Convert template to html string
     * @private
     */
    _compileTemplate: function () {
        var template = _.isFunction(this.template)
            ? this.template.call(this, this.getTemplateData())
            : this.template;

        // Check has root tag
        if (/^\s*</.test(template) === false) {
            throw new Jii.exceptions.InvalidConfigException("View template must have the single root element. This is wrong: " + template);
        }

        return template;
    },

    /**
     * Initialize DOM and save it in `$el` param
     * @param {string} template
     * @private
     */
    _initializeDom: function (template) {
        // Initialize DOM
        this.$el = self._jQuery(template);

        // Check for single tag
        if (this.$el.length !== 1) {
            //throw new Jii.exceptions.InvalidConfigException("View template must have only one root element. This is wrong: " + template);
        }

        // Attach marker class
        this.$el.addClass(self.MARKER_CLASS);
    },

    /**
     * Insert dom to parent. See options `appendTo`, `prependTo`, `replaceThis`
     * @private
     */
    _insertDom: function () {
        if (this.prependTo) {
            this.prependTo.before(this.$el);
        }
        else if (this.appendTo) {
            this.appendTo.after(this.$el);
        }
        else if (this.replaceThis) {
            this.appendTo.replaceWith(this.$el);
        }
    }

    /**
     * Get the closest containing StickyView
     * @returns {Joints.StickyView}
     */
    /*parentView: function()
     {
     return this.$el.parent().view();
     }*/

}, {

    MARKER_CLASS: 'jiiView',
    MARKER_SELECTOR: '.jiiView',

    /**
     * Get jQuery object by html or dom element
     * @returns {jQuery}
     * @private
     */
    _jQuery: function(element) {
        if (Jii.isNode) {
            if (!_.isString(element)) {
                throw new Jii.exceptions.InvalidParamException(self.debugClassName + '._jQuery() support only string value in first argument.');
            }

            return require('cheerio').load('<div>' + element + '</div>')('>');
        }

        return jQuery(element);
    }

});
