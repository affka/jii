/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.widgets.dialog.DialogWidget
 * @extends Jii.base.Widget
 */
Joints.defineClass('Jii.widgets.dialog.DialogWidget', Jii.base.Widget, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/dialog/dialog.html')),

    /**
     * @type boolean
     */
    isOpen: false,

    /**
     * @type jQuery
     */
    $content: null,

    events: {
        'click .button-close a': 'close'
    },

    _defaultOptions: {
        title: '',
        view: null,
        width: 400,
        height: 'auto',
        minWidth: null,
        minHeight: null,
        maxWidth: null,
        maxHeight: null,
        isModal: false,
        isFixed: false,
        isDraggable: false,
        isResizable: false,
        alignMode: 'position',
        position: {
            my: 'center center',
            at: 'center center'
        },
        buttons: []
    },

    getTemplateData: function() {
        return {
            title: this.options.title
        };
    },

    initialize: function () {
        // merge options with defaults
        this.options = _.extend({}, this._defaultOptions, this.options);

        if (this.options.isModal) {
            this.options.isFixed = false;
        }

        if (this.options.alignMode === 'position' && !this.options.isDraggable) {
            $(window).on('resize', _.bind(this.initializeWindowSize, this));
        }
    },

    onRender: function () {
        var classes = ['dialog', 'wrapper', 'alignMode-' + this.options.alignMode];
        if (this.options.isModal) {
            classes.push('isModal');
        }

        this.$el.addClass(classes.join(' '));
        this.$el.hide();

        if (this.options.isDraggable) {
            if (!jQuery.fn.draggable) {
                throw new Joints.Exception('Not find jQueryUI.draggable. Please install it from http://jqueryui.com/draggable/.');
            }

            this.$('.window').draggable({
                handle: '.header'
            });
            this.$el.addClass('isDraggable');
        }

        this.$content = this.$('.content');
    },

    open: function () {
        if (this.isOpen === true) {
            return;
        }

        this.$el.show();
        this.isOpen = true;

        this.doLayout();
        this.initializeWindowSize();

        this.trigger('open', this);
    },

    close: function () {
        if (!this.isOpen) {
            return;
        }

        this.$el.hide();
        this.isOpen = false;

        this.trigger('close', this);
    },

    setTitle: function(title) {
        this.$('.header h1').text(title);
    },

    initializeWindowSize: function () {
        this.$('.window').css({
            width: this.options.width,
            height: this.options.height,
            minWidth: this.options.minWidth,
            minHeight: this.options.minHeight,
            maxWidth: this.options.maxWidth,
            maxHeight: this.options.maxHeight
        });

        switch (this.options.alignMode) {
            case 'table':
                if (!_.isString(this.options.position.at)) {
                    throw new Joints.Exception('Option `at` in position must be string with align mode `table`.');
                }

                var pos = this.options.position.at.split(' ');

                // convert format `center` to `center center`
                if (pos.length === 1) {
                    pos.push(pos[0]);
                }

                pos[1] = pos[1].replace('center', 'middle');

                this.$('.container-table-cell').css({
                    'text-align': pos[0],
                    'vertical-align': pos[1]
                });
                break;

            case 'position':
                if (!jQuery.position) {
                    throw new Joints.Exception('Not find jQueryUI.position. Please install it from http://jqueryui.com/position/.');
                }

                this.$('.window').position(_.extend({
                    of: window //this.options.isFixed || this.options.isModal ? window : document // @todo
                }, this.options.position || {}));
                this.$('.window').css({
                    position: this.options.isFixed ? 'fixed' : 'absolute'
                });
                break;
        }
    }
});
