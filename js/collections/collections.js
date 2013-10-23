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
    model: app.Product
});