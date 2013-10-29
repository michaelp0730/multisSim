// collections.js
var app = app || {};

app.CartCollection = Backbone.Collection.extend({
    model: app.Cart
});

app.SlotCollection = Backbone.Collection.extend({
    model: app.Slot,
    url: 'json/data.json'
});

app.ProductsCollection = Backbone.Collection.extend({
    model: app.Product,
    getCountByAsin: function() {
        var asins = {};
        _.each(this.models, function(model) {
            if (undefined === asins[model.get('asin')]) {
                asins[model.get('asin')] = {
                    count: 1,
                    model: model
                };
            } else {
                asins[model.get('asin')].count++;
                if (model.get('status') === 'damaged') {
                    asins[model.get('asin')].model.set('status', 'damaged');
                }

                if (model.get('actions').activation !== undefined) {
                    asins[model.get('asin')].model.set('actions', { activation : true });
                }
            }
        });

        return asins;
    }
});

app.ActionsCollection = Backbone.Collection.extend({
    model: app.Action
});