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
Joints.collectionScanAndBind = function(collection, fn) {
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
Joints.collectionScanAndBindAsync = function(collection, fn, batchSize) {

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

Joints.asyncQueue = function() {

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

function calcScrollSize()
{
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
Joints.getScrollSize = function(forceRecalculate) {

    if (scrollSize == null || forceRecalculate) {
        calcScrollSize();
    }

    return scrollSize;
};

