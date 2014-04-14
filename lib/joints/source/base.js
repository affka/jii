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
Joints.noConflict = function() {
    root.Joints = previousJoints;
    return this;
}

/**
 *
 * @type {Function}
 */
Joints.noop = root.jQuery ? jQuery.noop : function(){};

/**
 * Ensure namespace structure is created
 * @param name Full namespace name
 * @param {Function} [scopeFn] Function to run with the namespace as a first param
 * @returns {Object} Namespace object
 */
Joints.namespace = function(name, scopeFn)
{
    name = name ? name.split('.') : [];

    var i,
        currentScope = name[0] === 'Joints' ? root : window;

    // Find or create
    for (i = 0; i < name.length; i++)
    {
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
Joints.extend = function(parentClass, protoProps, staticProps) {
    var childClass;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        childClass = coverVirtual(protoProps.constructor, parentClass);
    } else {
        childClass = function(){ return parentClass.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(childClass, parentClass);
    extendWithSuper(childClass, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = childClass; };
    Surrogate.prototype = parentClass.prototype;
    childClass.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) extendWithSuper(childClass.prototype, protoProps);

    return childClass;
};

function extendWithSuper(childClass, newProperties)
{
    // Extend and setup virtual methods
    _.each(newProperties, function(value, key) {
        if (typeof value == 'function' && typeof childClass[key] == 'function' && childClass[key] !== Joints.noop)
            childClass[key] = coverVirtual(value, childClass[key]);
        else
            childClass[key] = value;
    });

    // Default state
    if (!childClass._super)
        childClass._super = Joints.noop;
}

function coverVirtual(childMethod, parentMethod)
{
    return function()
    {
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
 */
Joints.defineClass = function(globalName, parentClass, prototypeProperties, staticProperties)
{
    // Split namespace
    var pos = globalName.lastIndexOf('.'),
        localName = globalName.substr(pos+1);

    // Extend class
    var newClass = Joints.namespace(globalName.substr(0, pos))[localName] =
        Joints.extend(parentClass, prototypeProperties, staticProperties);

    // Add name to class
    newClass.debugClassName = newClass.prototype.debugClassName = globalName;
};

/**
 *
 * @param {String} namespace
 * @param {String} relativeName
 * @param {Function} parentClass
 * @param {Object} prototypeProperties
 * @param {Object} [staticProperties]
 */
Joints.defineClassIn = function(namespace, relativeName, parentClass, prototypeProperties, staticProperties)
{
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
Joints.Object = function() {

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
Joints.Object.inst = function() {

    // Create once
    if (!this._inst)
        this._inst = new this();

    // Note: "this" is a class, not an object
    return this._inst;
};

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

    constructor: function(message) {
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

    toString: function()
    {
        return this.message;
    }
});

/**
 *
 * @param {*} fact
 * @param {String} [errorMessage='Assertion failed']
 */
Joints.assert = function(fact, errorMessage)
{
    if (!fact)
        throw new Joints.Exception(errorMessage || 'Assertion failed');
};

