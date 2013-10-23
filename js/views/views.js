// views.js
var app = app || {};

// Scan Workstations
app.ScanWorkstationView = Backbone.View.extend({
    initialize: function() {
        this.visible = false;
        this.listen();
    },
    show: function() {
        this.$el.show();
        this.visible = true;
    },
    hide: function() {
        this.$el.hide();
        this.visible = false;
    },
    listen: function() {
        var view = this;
        $('#workstation-input').keypress(function(e) {
            if (view.visible === true) {
                e.preventDefault();
                if (e.which === 13) {
                    $.publish('workstation.scanned', e);
                }
            }
        });
    }
});

// Home Base view
app.BaseView = Backbone.View.extend({
    el: $('#multisScreen'),
    show: function() {
        this.$el.show();
    },
    hide: function() {
        this.$el.hide();
    }
});

// Scan Cart view
app.ScanCartView = Backbone.View.extend({
    initialize: function() {
        this.listen();
    },
    listen: function() {
        var view = this;
        $('#scanner-input').keypress(function(e) {
            if (e.which === 13 && $(this).val() === 'SR2085' || e.which === 13 && $(this).val() === 'sr2085') {
                $.publish('cart.scanned', e);
            }
            $('#scanner-input').val('');
        });
    }
});

// Main Header view
app.MainHeaderView = Backbone.View.extend({
    el: $('#main-header'),
    template: _.template( $('#main-header-template').html() ),
    show: function() {
        this.$el.html(this.template);
    }
});

// Process view
app.ProcessView = Backbone.View.extend({
    el: $('#process'),
    initialize: function() {
        this.step1 = this.$el.find('#multis-process-arrow-left');
        this.step2 = this.$el.find('#multis-process-arrow-center');
        this.step3 = this.$el.find('#multis-process-arrow-right');
        this.currentStep = 1;
        this.step(1);
    },
    step: function(step) {
        if (step === 1) {
            this.step2.removeClass('center-arrow-complete').addClass('center-arrow-incomplete');
            this.step3.removeClass('right-arrow-complete').addClass('right-arrow-incomplete');
        } else if (step === 2) {
            this.step2.removeClass('center-arrow-incomplete').addClass('center-arrow-complete');
            this.step3.removeClass('right-arrow-complete').addClass('right-arrow-incomplete');
        } else if (step === 3) {
            this.step2.removeClass('center-arrow-incomplete').addClass('center-arrow-complete');
            this.step3.removeClass('right-arrow-incomplete').addClass('right-arrow-complete');
        }
    },
    next: function() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.step(this.currentStep);
        }
    },
    reset: function() {
        this.currentStep = 1;
        this.step(1);
    }
});

// Slot view
app.SlotView = Backbone.View.extend({
    el: $('#multis-slot-recommendation'),
    template: _.template('<h1 id="multis-slot"><%= id %></h1>'),
    render: function() {
        var model = this.model;
        this.$el.html(this.template({
            id: model.get('id')
        }));
    }
});

// Boxrec view
app.BoxRecView = Backbone.View.extend({
    el: $('#multis-box-recommendation'),
    template: _.template('<h1 id="multis-box"><%= boxRec %></h1>'),
    render: function() {
        var model = this.model;
        this.$el.html(this.template({
            boxRec: model.get('boxRec')
        }));
        // Change the class on the BoxRec after 3 seconds
        window.setTimeout(function() {
            $('#multis-box').removeClass().addClass('direction-faded');
        }, 3000);
    }
});

// Caret Left View
app.CaretLeftView = Backbone.View.extend({
    el: $('#multis-caret-column-left'),
    template: _.template( $('#caret-left-template').html() ),
    show: function() {
        this.$el.html(this.template);
    },
    hide: function() {
        this.$el.hide();
    }
});

app.ItemsView = Backbone.View.extend({
    el: $('#center-column'),
    template: _.template($('#items-view-template').html()),
    initialize: function() {
        this.scanned = new app.ProductsCollection();
        this.unscanned = new app.ProductsCollection();
        this.active = false;
        this.listen();
    },
    setModel: function(model) {
        this.active = true;
        this.model = model;
        this.unscanned = model.get('items');
        this.render();
    },
    deactivate: function() {
        this.active = false;
    },
    render: function() {
        var view = this,
            model = this.model;
        if (this.unscanned.length > 0) {
            // Render scannable UI
            this.$el.html(this.template({
                mode: 'scanning',
                unscanned: view.unscanned.models,
                scanned: view.scanned.models
            }));
        } else if(this.scanned.length > 0 && this.unscanned.length === 0) {
            // Render Slot Items complete UI
            this.$el.html(this.template({
                mode: 'slotItemsComplete',
                unscanned: view.unscanned.models,
                scanned: view.scanned.models
            }));
        } else {
            this.$el.html(this.template({
                mode: "scanCart"
            }));
        }
    },
    listen: function() {
        var view = this,
            model = this.model;

        $('#scanner-input').keypress(function(e) {
            scanValue = $(this).val();
            if (e.which === 13) {
                if (view.active === false) {
                    if (scanValue === "SR2085") {
                        $.publish('cart.scanned', [scanValue]);
                    }
                } else {
                    var validItems = view.unscanned.where({asin: scanValue}),
                        scannedItem;
                    $('#multis-slot').removeClass().addClass('direction-faded');

                    if (validItems.length > 0) {
                        scannedItem = validItems.shift();
                        view.scanned.add(scannedItem);
                        view.unscanned.remove(scannedItem);
                    }

                    if (view.unscanned.length === 0) {
                        $.publish('slotItems.scanned');
                        this.active = false;
                    }
                }
                view.render();
                $('#scanner-input').val('');
            }
        });
    }
});

// Shipment Steps view
app.ShipmentStepsView = Backbone.View.extend({
    el: $('#shipment-information'),
    template: _.template($('#shipment-template').html()),
    initialize: function() {
        this.active = false;
        this.actions = [];
        this.listen();
    },
    setModel: function(model) {
        this.model = model;
        this.actions = [];

        var actions = model.get('actions'), data;
        actions.SPOO = true;
        for (var type in actions) {
            switch (type) {
                case "SPOO":
                    data = new app.Action({
                        type: "spoo",
                        status: "inactive",
                        text: {
                            "inactive": "SP00 Label Required",
                            "active": "Scan SP00 Label",
                            "complete": "SP00 Label Scanned"
                        }
                    });
                    break;
            }
        }
        this.actions.push(data);
    },
    render: function() {
        //console.log(this.active, this.model);
        var view = this,
            model = this.model;

        this.$el.html(this.template({
            active: view.active,
            steps: view.actions
        }));
    },
    activate: function() {
        this.active = true;
        _.each(this.actions, function(a) {
            a.set("status", "active");
        });
    },
    listen: function() {
        var view = this,
            model = this.model;
        $('#scanner-input').on('keypress', function(e) {
            if (view.active === true) {
                var code = e.keyCode || e.which,
                    val;
                if (code === 13) {
                    val = $(this).val();
                    if (val.match(/^sp/i)) {
                        // SP00 scanned
                        console.log('SPOOOOOOOO');
                    } else {
                        console.log('NOT SPOOOO');
                    }
                }
            }
        });
    }
});