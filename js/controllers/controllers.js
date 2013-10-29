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

    problemMenuView = new app.ProblemMenuView(),

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

function problemSolveScanHandler(e) {
    var code = e.keyCode || e.which;
    if (code === 13) {
        app.utils.Modal.hide();
        $.publish('slot.complete', ['asdf', true])
        $('#scanner-input').off('keypress', problemSolveScanHandler);
        $(this).val('');
    }
};

$.subscribe('slotItems.scanned', function(e, isDamaged) {
    shipmentStepsView.activate();
    shipmentStepsView.render();

    if (isDamaged === true) {
        app.utils.Modal.show('#problem-solve-tote-modal');
        $('#scanner-input').on('keypress', problemSolveScanHandler);
    }
});

$.subscribe('slot.complete', function(e, spoo, isDamaged) {
    shipmentStepsView.complete();
    loadSlot();
    slotView.render();
    boxRecView.render();
    itemsView.render();
    lastShipment.render(spoo, isDamaged);
});

$.subscribe('hotkey.damaged', function(e) {
    problemMenuView.hide();
    app.utils.Modal.show("#damaged-item-modal");
    $.publish('damaged.pending');
});

$.subscribe('item.damaged', function(item) {
    app.utils.Modal.hide();
    shipmentStepsView.setDamaged();
});

// This section defines a buffered reader for keystrokes
(function() {
    var buffer = "",
        $input = $('#scanner-input'),
        delay = 50,
        timeout;

    var bufferedCheck = function(e) {
        var code = e.which || e.keyCode,
            ch = String.fromCharCode(code);

        if (ch.length > 0 && ch.match(/^[a-z0-9]$/i)) {
            buffer += ch;
            clearTimeout(timeout);
            timeout = setTimeout(bufferHandler, delay);
        } else if (code === 13) {
            clearTimeout(timeout);
            bufferHandler();
        } else if (code === 27) {
            clearTimeout(timeout);
            $.publish('hotkey.escape');
        }
    };

    var bufferHandler = function() {
        switch (buffer.toUpperCase()) {
            case "P":
                // Show Problem menu
                $.publish('hotkey.problem');
                break;

            case "D":
                $.publish('hotkey.damaged');
                break;

            case "M":
                $.publish('hotkey.missing');
                break;

            case "U":
                $.publish('hotkey.unscannable');
                break;

            case "B":
                $.publish('hotkey.back');
                break;
        }

        // Clear both input field and buffer
        $input.val("");
        buffer = "";
    };

    $(document).on('keypress', bufferedCheck);
})();