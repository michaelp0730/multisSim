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

    slotView, boxRecView,

    loadSlot = function() {
        if (allSlots.length > 0) {
            var slot = allSlots.shift();
            init(slot);
        } else {
            // Handle no slots left
            // Cart complete
        }
    },

/*
    Initialization
*/
    init = function(model) {
        slotView = new app.SlotView({
            model: model
        });

        boxRecView = new app.BoxRecView({
            model: model
        });

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
    var slotHeight = $('#multis-slot-recommendation').height();
    $('#multis-slot').addClass('slot-red').css({lineHeight: slotHeight + 'px'});
    $('#multis-box').addClass('boxrec-purple').css({lineHeight: slotHeight + 'px'});
    caretLeftView.show();
    shipmentStepsView.render();
}

$.subscribe('cart.scanned', function(e) {
    allSlots.fetch({
        success: function() {
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
    var slotHeight = $('#multis-slot-recommendation').height();
    $('#multis-slot').removeClass().addClass('slot-red').css({lineHeight: slotHeight + 'px'});
    $('#multis-box').removeClass().addClass('boxrec-purple').css({lineHeight: slotHeight + 'px'});
});