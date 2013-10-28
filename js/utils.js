var app = app || {};
app.utils = (function($) {
    var Modal = (function() {
        var $container = $('#multis-modal-container'),
            $overlay = $container.find('.modal-bg'),
            $modals = $container.find('.modal-container,.modal-container2');

        return {
            show: function(id, tpl, data) {
                var $m = $container.find(id),
                    template, mHeight;

                if ($m.length > 0) {
                    $overlay.show();
                    if (!!data) {
                        template = _.template($(tpl).html());
                        $m.html(template(data));
                    }
                    mHeight = $m.outerHeight();
                    $m.show().css('margin-top', '-' + (mHeight / 2) + 'px'); // If needed, center the modal here
                }
            },
            hide: function() {
                $modals.hide();
                $overlay.hide();
            }
        };
    })();

    return {
        Modal: Modal
    };
})(jQuery);