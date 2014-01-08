/**
 * @class Jii.widgets.grid.GridWidget
 * @extends Jii.base.Widget
 */
var self = Joints.defineClass('Jii.widgets.grid.GridWidget', Jii.base.Widget, {

    template: _.template(RIABuilder.getTemplate('lib/jii/widgets/grid/templates/grid.html')),
    rowsTemplate: _.template(RIABuilder.getTemplate('lib/jii/widgets/grid/templates/row.html')),
    headerTemplate: _.template(RIABuilder.getTemplate('lib/jii/widgets/grid/templates/header.html')),

    columns: null,
    collection: null,

    initialize: function (options) {
        options = options || {};
        this.columns = options.columns || {};

        // Normalize column data
        var firstModel = this.collection.at(0);// || this.collection.model();
        for (var i = 0, l = this.columns.length; i < l; i++) {
            if (_.isString(this.columns[i])) {
                this.columns[i] = {
                    name: this.columns[i]
                };
            }

            if (!this.columns[i].header) {
                this.columns[i].header = firstModel instanceof Jii.base.Model ?
                    firstModel.getAttributeLabel(this.columns[i].name) :
                    '';
            }

            if (!this.columns[i].value) {
                this.columns[i].value = function (model, i) {
                    return model.get(this.columns[i].name);
                };
            }
        }
    },

    getTemplateData: function () {
        return {
            header: this._buildHeader(),
            rows: this._buildRows(),
            title: this.options.title || ''
        };
    },

    _buildHeader: function () {
        var header = '';
        _.each(this.columns, _.bind(function (column) {
            header += this.headerTemplate({
                header: column.header
            });
        }, this));
        return header;
    },

    _buildRows: function () {
        var rows = '';

        this.collection.each(_.bind(function (model) {
            var tpl = _.template('<td><%= data %></td>'),
                cells = '';

            _.each(this.columns, _.bind(function (column, i) {
                cells += tpl({
                    data: column.value.call(this, model, i)
                });
            }, this));

            rows += this.rowsTemplate({
                cells: cells
            });
        }, this));
        return rows;
    }

});
