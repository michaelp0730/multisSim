// collections.js
var app = app || {};

app.CartCollection = Backbone.Collection.extend({
    model: app.Cart
});

app.SlotCollection = Backbone.Collection.extend({
    model: app.Slot,
    url: 'json/data-small.json'
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
            }
        });

        return asins;
    }
});

app.ActionsCollection = Backbone.Collection.extend({
    model: app.Action
});