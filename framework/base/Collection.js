/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

(function () {
    /**
     * @class Jii.base.Collection
     * @extends Joints.Collection
     */
    var self = Joints.defineClass('Jii.base.Collection', Joints.Collection, {

        proxy: null,

        initialize: function(models, options) {
            this._super.apply(this, arguments);

            this.proxy = options.proxy || null;
        },

        fetch: function() {
            if (this.proxy === null) {
                throw new Jii.exceptions.ApplicationException('Not find proxy for fetch collection.');
            }

            // Send request
            var deferred = this.proxy.read();

            // Set errors, if exists or run trigger update as success updated form
            deferred.done(_.bind(function (data) {
                if (data.errors) {
                    // @todo Set error
                } else {
                    this.add(data.list);
                    this.trigger('fetch');
                }
            }, this));

            // Set global failure message
            deferred.fail(_.bind(function (error) {
                // @todo Set error
                console.error('Jii.base.Collection:', error);
            }, this));
        },

        _prepareModel: function(attrs, options) {
            if (attrs instanceof Jii.base.Model) {
                return attrs;
            }

            var model = new this.model(options);
            model.setAttributes(attrs);
            return model;
        }

    });

})();