// models.js
var app = app || {};

app.Cart = Backbone.Model.extend({
    defaults: {
        id: 'sr2085'
    }
});

app.Slot = Backbone.Model.extend({
    defaults: {
        id: '',
        boxrec: '',
        actions: {},
        items: []
    },
    get: function(k) {
        if (k === "items") {
            return new app.ProductsCollection(this.attributes.items);
        } else if (this.attributes[k] !== undefined) {
            return this.attributes[k];
        }
        return null;
    }
});

app.Product = Backbone.Model.extend({
    defaults: {
        asin: '',
        title: '',
        actions: {},
        demoActions: {}
    }
});

app.Action = Backbone.Model.extend({
    defaults: {
        status: "inactive",
        text: {
            "inactive": "foo",
            "active": "bar",
            "complete": "baz"
        }
    },

    getText: function() {
        return this.get('text')[this.get('status')];
    }
});
