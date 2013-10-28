// controllers.js
var app = app || {},

/*
    View Variables
*/
    scanWorkstation = new app.ScanWorkstationView({
        el: $('#multis-scan-workstation-wrapper')
    }),

    baseView = new app.BaseView(),

    mainHeaderView = new app.MainHeaderView(),

    processView = new app.ProcessView(),

    caretLeftView = new app.CaretLeftView(),

    shipmentStepsView = new app.ShipmentStepsView(),

    itemsView = new app.ItemsView(),

    allSlots = new app.SlotCollection(),

    lastShipment = new app.LastShipmentView(),

    cartCompleteView = new app.CartCompleteView(),

    slotView = new app.SlotView(),

    boxRecView = new app.BoxRecView(),

    slotView, boxRecView,

    loadSlot = function() {
        if (allSlots.length > 0) {
            var slot = allSlots.shift();
            init(slot);
        } else {
            processView.next();
            $('#multis-item-info').hide();
            cartCompleteView.render();
        }
    },

/*
    Initialization
*/
    init = function(model) {
        boxRecView.setModel(model);

        slotView.setModel(model);

        itemsView.setModel(model);

        shipmentStepsView.setModel(model);
    };

// Show Scan Workstation view when the app loads
    scanWorkstation.show();

/*
    Events
*/

$.subscribe('workstation.scanned', function(e) {
    scanWorkstation.hide();
    baseView.show();
    mainHeaderView.show();
    itemsView.render();
    $('#scanner-input').focus();
});

function initializeSlotView() {
    loadSlot();

    // Reset Process View
    processView.next();

    slotView.render();
    boxRecView.render();
    caretLeftView.show();
    shipmentStepsView.render();
}

$.subscribe('cart.scanned', function(e) {
    allSlots.fetch({
        success: function() {
            cartCompleteView.hide();
            $('#multis-item-info').show();
            initializeSlotView();
        }
    });
});

$.subscribe('item.scanned', function(item) {
    lastShipment.hide();
});

$.subscribe('slotItems.scanned', function() {
    shipmentStepsView.activate();
    shipmentStepsView.render();
});

$.subscribe('slot.complete', function(e, spoo) {
    shipmentStepsView.complete();
    loadSlot();
    slotView.render();
    boxRecView.render();
    itemsView.render();
    lastShipment.render(spoo);
});