(function () {
    /**
     * Joints.js
     * The library to guide the development of apps backed by Backbone.js
     * @file Joints.js basic namespace, utils, and classes
     * @copyright Pavel Koryagin, ExtPoint
     * @author Pavel Koryagin, pavel@koryagin.com
     * @license MIT
     */

    // Save a reference to the global object (`window` in the browser, `exports` on the server).
    var root = this;

    var previousJoints = root.Joints;

    /**
     * @namespace Joints
     */
    var Joints = root.Joints = {};

    Joints.root = root;

    /**
     *
     * @return {Joints}
     */
    Joints.noConflict = function () {
        root.Joints = previousJoints;
        return this;
    }

    /**
     *
     * @type {Function}
     */
    Joints.noop = root.jQuery ? jQuery.noop : function () {
    };

    /**
     * Ensure namespace structure is created
     * @param name Full namespace name
     * @param {Function} [scopeFn] Function to run with the namespace as a first param
     * @returns {Object} Namespace object
     */
    Joints.namespace = function (name, scopeFn) {
        name = name ? name.split('.') : [];

        var i,
            currentScope = root;

        // Find or create
        for (i = 0; i < name.length; i++) {
            var scopeName = name[i];

            if (!currentScope[scopeName]) {
                currentScope[scopeName] = { debugClassName: name.slice(0, i).join('.') };
            }
            currentScope = currentScope[scopeName];
        }

        // Run scoped code
        if (scopeFn) {
            Joints.namespace.currentNamespace = currentScope;
            scopeFn(currentScope);
            Joints.namespace.currentNamespace = null;
        }

        return currentScope;
    };
    Joints.namespace.currentNamespace = null;

    /**
     * Extend class
     * @param {Function} parentClass
     * @param {Object} [protoProps]
     * @param {Object} [staticProps]
     * @returns {Function} New class
     */
    Joints.extend = function (parentClass, protoProps, staticProps) {
        var childClass;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            childClass = coverVirtual(protoProps.constructor, parentClass);
        } else {
            childClass = function () {
                return parentClass.apply(this, arguments);
            };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(childClass, parentClass);
        extendWithSuper(childClass, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function () {
            this.constructor = childClass;
        };
        Surrogate.prototype = parentClass.prototype;
        childClass.prototype = new Surrogate;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) extendWithSuper(childClass.prototype, protoProps);

        return childClass;
    };

    function extendWithSuper(childClass, newProperties) {
        // Extend and setup virtual methods
        _.each(newProperties, function (value, key) {
            if (typeof value == 'function' && typeof childClass[key] == 'function' && childClass[key] !== Joints.noop)
                childClass[key] = coverVirtual(value, childClass[key]);
            else
                childClass[key] = value;
        });

        // Default state
        if (!childClass._super)
            childClass._super = Joints.noop;
    }

    function coverVirtual(childMethod, parentMethod) {
        return function () {
            var old = this._super;
            this._super = parentMethod;
            var r = childMethod.apply(this, arguments);
            this._super = old;
            return r;
        };
    }

    /**
     *
     * @param {String} globalName
     * @param {Function} parentClass
     * @param {Object} [prototypeProperties]
     * @param {Object} [staticProperties]
     * @return {function}
     */
    Joints.defineClass = function (globalName, parentClass, prototypeProperties, staticProperties) {
        // Split namespace
        var pos = globalName.lastIndexOf('.'),
            localName = globalName.substr(pos + 1);

        // Extend class
        var newClass = Joints.namespace(globalName.substr(0, pos))[localName] =
            Joints.extend(parentClass, prototypeProperties, staticProperties);

        // Add name to class
        newClass.debugClassName = newClass.prototype.debugClassName = globalName;

        // Add static link
        newClass.prototype.static = newClass;

        return newClass;
    };

    /**
     *
     * @param {String} namespace
     * @param {String} relativeName
     * @param {Function} parentClass
     * @param {Object} prototypeProperties
     * @param {Object} [staticProperties]
     */
    Joints.defineClassIn = function (namespace, relativeName, parentClass, prototypeProperties, staticProperties) {
        Joints.defineClass(
            // Map name
            namespace.debugName + '.' + relativeName,
            // Pass rest
            parentClass, prototypeProperties, staticProperties
        );
    };

    /**
     * Base class for all objects, except Backbone based
     * @class Joints.Object
     */
    Joints.Object = function () {

    };

    Joints.Object.prototype = {

        /**
         * @type {Function}
         */
        _super: Joints.noop
    };

    Joints.Object._super = Joints.noop;

    /**
     * Singleton support
     * @returns {*}
     */
    Joints.Object.inst = function () {

        // Create once
        if (!this._inst)
            this._inst = new this();

        // Note: "this" is a class, not an object
        return this._inst;
    };

    /**
     * Mapping to jquery deferred class
     * @type {Object}
     */
    var jQueryDeferred = root.jQuery ? root.jQuery : require('jquery-deferred');
    Joints.Deferred = jQueryDeferred.Deferred;
    Joints.when = jQueryDeferred.when;

    /**
     * Base class for all exceptions
     * @class Joints.Exception
     * @extends Joints.Object
     */
    Joints.defineClass('Joints.Exception', Error, {

        /**
         * Text message
         * @type {String}
         */
        message: null,

        /**
         * Extra information dumps
         * @type {Array}
         */
        extra: null,

        constructor: function (message) {
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor || this);
            }

            this.name = this.constructor.name;
            this.message = message || '';

            if (arguments.length > 1) {
                this.extra = Array.prototype.slice.call(arguments, 1);
            }

            this._super();
        },

        toString: function () {
            return this.message;
        }
    });

    /**
     *
     * @param {*} fact
     * @param {String} [errorMessage='Assertion failed']
     */
    Joints.assert = function (fact, errorMessage) {
        if (!fact)
            throw new Joints.Exception(errorMessage || 'Assertion failed');
    };


    /**
     * @file Joints.js extra utils
     * @copyright Pavel Koryagin, ExtPoint
     * @author Pavel Koryagin, pavel@koryagin.com
     * @license MIT
     */

    /**
     * @param {Backbone.Collection} collection
     * @param {Function} fn function(model, [addOptions]) { }
     */
    Joints.collectionScanAndBind = function (collection, fn) {
        collection.each(function (model) {
            fn(model); // Skip 2nd and rest paramenters
        });
        collection.on('add', fn);
    };

    /**
     * @param {Backbone.Collection} collection
     * @param {Function} fn function(model, [addOptions]) { }
     * @param {Number} [batchSize]
     */
    Joints.collectionScanAndBindAsync = function (collection, fn, batchSize) {

        batchSize || (batchSize = 20);

        // Copy related
        var models = collection.toArray(),
            pointer = 0;

        // Bind as usual
        collection.on('add', fn);


        // Define portion
        function fire() {

            var step = 0;

            // Exec
            while (step < batchSize && pointer < models.length) {

                fn(models[pointer]);

                step++;
                pointer++;
            }

            // Defer next
            if (models.length)
                setTimeout(fire, 0);
        }

        // Run first portion
        fire();
    };

    Joints.asyncQueue = function () {

        var position = 0,
            functions = arguments;

        function fire() {

            // Call
            functions[position]();

            // Shift
            position++;

            // Schedule next
            if (position < functions.length)
                setTimeout(fire, 0);
        }

        fire();
    };

    var scrollSize;

    function calcScrollSize() {
        var tmp = $('<div style="overflow:auto;width:100px;height:100px;zIndex:-100"><div style="height:200px"></div></div>')
            .appendTo('body');
        scrollSize = tmp.width() - tmp.children().width();
        tmp.remove();
    }

    /**
     * Calculate current effective scroll size
     * @param {Boolean} [forceRecalculate] Set true to recalculate known value
     * @returns {Number}
     */
    Joints.getScrollSize = function (forceRecalculate) {

        if (scrollSize == null || forceRecalculate) {
            calcScrollSize();
        }

        return scrollSize;
    };


    /**
     * @copyright
     * @author
     * @license MIT
     */

    /**
     * @class Joints.Events
     * @extends Backbone.Events
     */
    if (typeof exports !== 'undefined') {
        //process.setMaxListeners(30);
        Joints.defineClass('Joints.Events', require('events').EventEmitter, {
            trigger: function() {
                this.emit.apply(this, arguments);
            }
        }, {
            inst: Joints.Object.inst
        });
    } else {
        Joints.defineClass('Joints.Events', Backbone.Events, {

            constructor: function() {
                _.extend(this, Backbone.Events);
            }

        }, {
            inst: Joints.Object.inst
        });
    }


    /**
     * @copyright
     * @author
     * @license MIT
     */

    /**
     * @class Joints.Collection
     * @extends Backbone.Collection
     */
    Joints.defineClass('Joints.Collection', Backbone.Collection, {

    }, {
        inst: Joints.Object.inst
    });


    /**
     * @copyright Pavel Koryagin, ExtPoint
     * @author Pavel Koryagin, pavel@koryagin.com
     * @license MIT
     */

    /**
     * @class Joints.RelationalModel
     * @extends Backbone.Model
     */
    Joints.defineClass('Joints.RelationalModel', Backbone.Model, {

        constructor: function (options) {

            // Construct
            this._super(options);

            // Enable relational storage logic
            if (this.constructor.collection) {
                this.constructor.collection.add(this);
            }
        },

        /**
         * @param {Backbone.Collection} foreignCollection
         * @param {String} foreignSecondaryKey
         */
        relation: function (foreignCollection, foreignSecondaryKey) {

            var where = {};
            where[foreignSecondaryKey] = this.get(this.idAttribute);

            return foreignCollection.where(where);
        },

        /**
         *
         * @param {Backbone.Collection} foreignCollection
         * @param {Function} filterFn
         * @returns {Joints.RelationalModel[]}
         */
        relationByFilter: function (foreignCollection, filterFn) {

            return foreignCollection.filter(filterFn.bind(this));
        }

    }, {

        collection: null,

        setupCollection: function (data, options) {
            options = options || {};

            this.collection = new Joints.Collection(data, _.extend({}, options, { model: this }));
            return this.collection;
        }
    });


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

        constructor: function (options) {
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

        getTemplateData: function () {
            var data = {};

            if (this.templateData) {
                _.merge(data, this.templateData);
            }

            if (this.model) {
                _.merge(data, this.model.attributes);
            }

            return data;
        },

        _render: function () {
            // Initialize by template, if used
            if (this.template != null) {
                Joints.assert(!this.el, "Cannot attach templated views like " + this.debugClassName + ".");
                // Create structure
                var template = _.isFunction(this.template)
                    ? this.template.call(this, this.getTemplateData())
                    : this.template;

                if (
                // Check has root tag
                    /^\s*</.test(template) &&

                        // Init DOM and check for single tag
                        (this.$el = $(template)).length == 1
                    ) {
                    // Keep $el, set el
                    this.el = this.$el[0];
                }
                else
                    throw new Joints.Exception("StickViews's template must have the single root element. This is wrong: " + template);
            }
            // Attach to el or create new as Backbone does
            else {
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
        viewSet: function (selector) {
            return (selector ? this.$el.find(selector) : this.$el).viewSet();
        },

        /**
         * Create Joints.ModelBinding by rules
         * @param {Object} rules
         * @returns {Joints.ModelBinding}
         */
        bindModel: function (rules) {
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
        parentView: function () {
            return this.$el.parent().view();
        }

        // TODO: consider to add anything like externalEvents: {}

    }, {
        DATA_ID: 'stickyView',
        MARKER_CLASS: 'stickyView',
        MARKER_SELECTOR: '.stickyView',

        /**
         *
         * @param {Object} options
         */
        bindCollection: function (options) {
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
        jQuery.fn.view = function () {
            var value = this.data(Joints.StickyView.DATA_ID);
            return value || this.closest(Joints.StickyView.MARKER_SELECTOR)
                .data(Joints.StickyView.DATA_ID) || null;
        };

        /**
         * @name views
         * @memberOf jQuery#
         */
        jQuery.fn.views = function () {
            var i, view, result = [];
            for (i = 0; i < this.length; i++) {
                view = $(this[i]).view();
                if (result.indexOf(view) == -1)
                    result.push(view);
            }
            return result;
        };

        /*
         Initialization
         */
        jQuery(function () {
            $(window).resize(function () {

                // Get all views
                var views = $(Joints.StickyView.MARKER_SELECTOR).views();

                while (views.length) {
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


})();