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

$.subscribe('item.scanned', function(e, scanValue) {
    var items = unscannedItemsView.model.attributes.items;
    for (n in items) {
        if (scanValue === items[n].asin) {
            var index = findWithAttr(items, 'asin', items[n].asin );
        }
    }
    $('#multis-slot').removeClass().addClass('direction-faded');
});

$.subscribe('slotItems.scanned', function() {
    shipmentStepsView.activate();
    shipmentStepsView.render();
});

$.subscribe('slot.complete', function() {
    console.log('slot.complete');
    shipmentStepsView.complete();
});

// Collection tests
var itemsToScan = new app.ProductsCollection(),
    scannedItems = new app.ProductsCollection();