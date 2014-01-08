/**
 * @copyright Pavel Koryagin, ExtPoint
 * @author Pavel Koryagin, pavel@koryagin.com
 * @license MIT
 */

/**
 * @class Joints.StickyView
 * @extends Backbone.View
 */
Joints.defineClass('Joints.StickyView', Backbone.View, {

    /**
     * Initialize with string or _.template.
     * Strings will be turned into _.template during construction.
     * @type {String|Function}
     */
    template: null,

    /**
     * Binding rules for Joints.ModelBinding
     * @type {Object}
     */
    modelBinding: null,

    /**
     * @type {Object}
     */
    options: {},

    /**
     * Method run after template rendered
     */
    onRender: Joints.noop,

    /**
     * Override this to set elements' sizes
     */
    doLayout: Joints.noop,

    /**
     * Override this to create children
     */
    createChildren: Joints.noop,

    templateData: null,

    constructor: function(options)
    {
        this.options = options || {};

        this.cid = _.uniqueId('view');
        options || (options = {});
        var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events', 'template'];
        _.extend(this, _.pick(options, viewOptions));
        this.initialize.apply(this, arguments);
        this._render();
        this.delegateEvents();

        if (this.className) {
            this.$el.addClass(this.className);
        }

        // Create children after render and initialization
        this.createChildren();

        // Apply size on initialization
        this.doLayout();
    },

    getTemplateData: function() {
        var data = {};

        if (this.templateData) {
            _.merge(data, this.templateData);
        }

        if (this.model) {
            _.merge(data, this.model.attributes);
        }

        return data;
    },

    _render: function()
    {
        // Initialize by template, if used
        if (this.template != null)
        {
            Joints.assert(!this.el, "Cannot attach templated views like "+this.debugClassName+".");
            // Create structure
            var template = _.isFunction(this.template)
                ? this.template.call(this, this.getTemplateData())
                : this.template;

            if (
                // Check has root tag
                /^\s*</.test(template) &&

                // Init DOM and check for single tag
                (this.$el = $(template)).length == 1
            ){
                // Keep $el, set el
                this.el = this.$el[0];
            }
            else
                throw new Joints.Exception("StickViews's template must have the single root element. This is wrong: " + template);
        }
        // Attach to el or create new as Backbone does
        else
        {
            // Use default backbone's  _ensureElement()
            this._super();
        }

        // Attach
        this.$el.data(Joints.StickyView.DATA_ID, this);
        this.$el.addClass(Joints.StickyView.MARKER_CLASS);

        // Insert to parent
        if (this.options.appendTo)
            this.$el.appendTo(this.options.appendTo);
        else if (this.options.prependTo)
            this.$el.prependTo(this.options.prependTo);
        else if (this.options.replaceEl)
            this.$el.replaceAll(this.options.replaceEl);

        // Connect model
        if (this.model) {

            // Destroy
            this.model.on('destroy', this.remove, this);

            // ModelBinding rules
            if (this.modelBinding)
                this.bindModel(this.modelBinding).fireAll();
        }

        // Additional logic for render
        this.onRender();
    },

    /**
     * Returns Joints.StickyViewSet for the own element if no selector or child element by provided selector
     * @param {string} [selector]
     * @returns {Joints.StickyViewSet}
     */
    viewSet: function(selector)
    {
        return (selector ? this.$el.find(selector) : this.$el).viewSet();
    },

    /**
     * Create Joints.ModelBinding by rules
     * @param {Object} rules
     * @returns {Joints.ModelBinding}
     */
    bindModel: function(rules) {
        return new Joints.ModelBinding({
            model: this.model,
            view: this,
            scope: this,
            rules: rules
        });
    },

    /**
     * Get the closest containing StickyView
     * @returns {Joints.StickyView}
     */
    parentView: function()
    {
        return this.$el.parent().view();
    }

    // TODO: consider to add anything like externalEvents: {}

},{
    DATA_ID: 'stickyView',
    MARKER_CLASS: 'stickyView',
    MARKER_SELECTOR: '.stickyView',

    /**
     *
     * @param {Object} options
     */
    bindCollection: function(options) {
        return new Joints.CollectionBinding(_.defaults({
            viewClass: this
        }, options));

    }
});

if (typeof jQuery !== 'undefined') {
    /**
     * @name view
     * @memberOf jQuery#
     */
    $.fn.view = function()
    {
        var value = this.data(Joints.StickyView.DATA_ID);
        return value || this.closest(Joints.StickyView.MARKER_SELECTOR)
            .data(Joints.StickyView.DATA_ID) || null;
    };

    /**
     * @name views
     * @memberOf jQuery#
     */
    $.fn.views = function()
    {
        var i, view, result = [];
        for (i = 0; i < this.length; i++)
        {
            view = $(this[i]).view();
            if (result.indexOf(view) == -1)
                result.push(view);
        }
        return result;
    };

    /*
        Initialization
    */
    $(function() {
        $(window).resize(function() {

            // Get all views
            var views = $(Joints.StickyView.MARKER_SELECTOR).views();

            while (views.length)
            {
                var view = views[0],
                    parentView;

                // Find unhandled root
                while (parentView = view.parentView() && views.indexOf(parentView) != -1) {
                    view = parentView;
                }

                // Notify
                view.doLayout();

                // Drop
                views.splice(views.indexOf(view), 1);
            }
        });
    });
}