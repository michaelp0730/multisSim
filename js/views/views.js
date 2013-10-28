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
    template: _.template('<h1 class="<%= (inactive) ? \'direction-faded\' : \'slot-\' + id.substring(0, 1) %>" id="multis-slot"><%= id %></h1>'),
    initialize: function() {
        this.listen();
        this.inactive = false;
    },
    setModel: function(model) {
        this.slotHeight = $('#multis-slot-recommendation').height();
        this.model = model;
        this.inactive = false;
    },
    render: function() {
        var view = this,
            model = this.model;
        this.$el.html(this.template({
            id: model.get('id'),
            inactive: view.inactive
        }));
        $('#multis-slot').css({lineHeight: this.slotHeight + 'px'});
    },
    listen: function() {
        var view = this;
        $.subscribe('item.scanned', function() {
            view.inactive = true;
            view.render();
        });
    }
});

// Boxrec view
app.BoxRecView = Backbone.View.extend({
    el: $('#multis-box-recommendation'),
    template: _.template('<h1 class="<%= (inactive) ? \'direction-faded\' : \'br-\' + boxRec %>" id="multis-box"><%= boxRec %></h1>'),
    initialize: function() {
        this.listen();
        this.inactive = false;
    },
    setModel: function(model) {
        this.boxRecHeight = $('#multis-box-recommendation').height();
        this.model = model;
        this.inactive = false;
    },
    render: function() {
        var view = this,
            model = this.model;
        this.$el.html(this.template({
            boxRec: model.get('boxRec'),
            inactive: view.inactive
        }));
        $('#multis-box').css({lineHeight: this.boxRecHeight + 'px'});
    },
    listen: function() {
        var view = this;
        $.subscribe('item.scanned', function() {
            view.inactive = true;
            view.render();
        });
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
        this.mode = 'inactive';
        this.listen();
    },
    setModel: function(model) {
        this.active = true;
        this.mode = 'active';
        this.model = model;
        this.unscanned = model.get('items');
        this.scanned = new app.ProductsCollection();
        this.render();
    },
    deactivate: function() {
        this.active = false;
    },
    complete: function() {
        this.active = false;
        this.mode = 'complete';
        console.log('Complete');
    },
    render: function() {
        var view = this,
            model = this.model;
        if (this.unscanned.length > 0) {
            // Render scannable UI
            this.$el.html(this.template({
                mode: 'scanning',
                unscanned: view.unscanned.getCountByAsin(),
                scanned: view.scanned.getCountByAsin(),
                unscannedLength: view.unscanned.length
            }));
        } else if(this.scanned.length > 0 && this.unscanned.length === 0) {
            // Render Slot Items complete UI
            this.$el.html(this.template({
                mode: 'slotItemsComplete',
                unscanned: view.unscanned.getCountByAsin(),
                scanned: view.scanned.getCountByAsin(),
                unscannedLength: 0
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
                if (view.active === false /* && view.mode !== 'complete' */) {
                    if (view.mode === 'inactive') {
                        if (scanValue === "SR2085" || scanValue === "sr2085") {
                            $.publish('cart.scanned', [scanValue]);
                            app.utils.Modal.hide();
                        } else {
                            app.utils.Modal.show('#invalid-cart-modal', '#modal-invalid-cart-template', {
                                scanVal: $(this).val()
                            });
                        }
                    } else if (view.mode === 'complete') {
                        view.mode = 'inactive';
                    }
                } else if (view.active === true) {
                    var validItems = view.unscanned.where({asin: scanValue}),
                        scannedItem;

                    if (scanValue.toUpperCase() === "ACTIVATION") {
                        app.utils.Modal.hide();
                        view.waitingForActivation = false;
                        view.scanned.add(view.currentItem);
                        view.unscanned.remove(view.currentItem);
                        $.publish('item.scanned', [view.currentItem]);
                    } else if (view.waitingForActivation !== true) {
                        if (validItems.length > 0) {
                            scannedItem = validItems.shift();
                            if (scannedItem.get('actions').activation !== undefined) {
                                // Show modal and wait for serial scan
                                app.utils.Modal.show('#activation-modal', '#modal-activation-template', {
                                    item: scannedItem
                                });
                                view.waitingForActivation = true;
                                view.currentItem = scannedItem;
                            } else {
                                view.scanned.add(scannedItem);
                                view.unscanned.remove(scannedItem);
                                $.publish('item.scanned', [scannedItem]);
                            }
                        }
                    }

                    if (view.unscanned.length === 0) {
                        $.publish('slotItems.scanned');
                        view.complete();
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
        this.offset = 0;
        this.listen();
    },
    setModel: function(model) {
        this.model = model;
        this.spoo = new app.Action({
            type: "spoo",
            status: "inactive",
            text: {
                "inactive": "SP00 Label Required",
                "active": "Scan SP00 Label",
                "complete": "Shipment Complete"
            }
        });

        this.actions = new app.ActionsCollection();
        var actions = model.get('actions');
        for (var type in actions) {
            switch (type) {
                case "PSLIP":
                    this.actions.add({
                        type: "pslip",
                        status: "inactive",
                        text: {
                            "inactive": "PSLIP Required",
                            "active": "Scan PSLIP",
                            "complete": "PSLIP Scanned"
                        }
                    });
                    break;
            }
        }
        if (this.actions.length === 1) {
            this.offset = 20;
        }
        this.render();
    },
    render: function() {
        var view = this,
            model = this.model;

        this.$el.html(this.template({
            active: view.active,
            spooStep: this.spoo,
            steps: view.actions
        }));

        var shipmentDblStepHeight = $('.shipment-double-step').height();
        $('.shipment-double-step h4').height( (shipmentDblStepHeight - this.offset) / 2 );
    },
    activate: function() {
        var view = this,
            model = this.model;

        view.active = true;
        if (this.actions.length === 0) {
            this.spoo.set('status', 'active');
        } else {
            var incompleteActions = this.actions.where({ status: "inactive" }),
                active = this.actions.where({ status: "active" }),
                nextAction;

            if (active.length > 0) {
                app.utils.Modal.hide();
                active[0].set("status", "complete");
            }

            if (incompleteActions.length > 0) {
                nextAction = incompleteActions[0];
                if (nextAction.get('type') === 'pslip') {
                    app.utils.Modal.show('#scan-pslip', '#modal-pslip-template', {
                        boxRec: model.get('boxRec')
                    });
                }
                nextAction.set('status', 'active');
            } else {
                this.spoo.set('status', 'active');
            }
        }
    },
    complete: function() {
        this.active = false;
        this.spoo.set('status', 'complete');
        this.render();
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
                    if (val.match(/^sp/i) && view.spoo.get('status') === 'active') {
                        // SP00 scanned
                        $.publish('slot.complete', [val]);
                        app.utils.Modal.hide();
                    } else if ( !(val.match(/^sp/i)) && view.spoo.get('status') === 'active' ) {
                        app.utils.Modal.show('#invalid-spoo-modal', '#modal-invalid-spoo-template', {
                            scanVal: val
                        });
                    } else if (val.match(/^pslip/i)) {
                        // Something else
                        view.activate();
                        view.render();
                    }
                }
            }
        });
    }
});

app.LastShipmentView = Backbone.View.extend({
    el: $('#last-shipment-complete-container'),
    render: function(spoo) {
        this.$el.find('p').html(spoo);
        this.show();
    },
    show: function() {
        this.$el.show();
    },
    hide: function() {
        this.$el.hide();
    }
});

app.CartCompleteView = Backbone.View.extend({
    el: $('#cart-complete-wrapper'),
    template: _.template($('#cart-complete-template').html()),
    initialize: function() {
        this.listen();
    },
    render: function() {
        var view = this;
        this.$el.html(this.template({
            spoo: view.lastSpoo
        }));
        this.show();
    },
    show: function() {
        this.$el.show();
    },
    hide: function() {
        this.$el.hide();
    },
    listen: function() {
        var view = this;
        $.subscribe('slot.complete', function(e, spoo) {
            view.lastSpoo = spoo;
        });
    }
});