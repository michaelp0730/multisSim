(function($) {
    var data_name = 'multilist',
        MultiList = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.multilist.defaults, options);
            this.$items = this.$element.find('a');
            this.init();
            this.listen();
        };

    $.fn.multilist = function(opt) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data(data_name),
                options = typeof opt === 'object' && opt;

            if (!data) {
                $this.data(data_name, (data = new MultiList(this, options)));
            }

            if (typeof opt === 'string') {
                data[opt]();
            }
        });
    };

    MultiList.prototype = {
        constructor : MultiList,

        init : function() {
            this.cols = this.$element.find('ul,ol');
            this.$curr_col = $(this.cols.get(0));
        },

        next : function() {
            var col_index = this.cols.index(this.$curr_col),
                items = this.$curr_col.find('li'),
                current = this.$curr_col.find('.current'),
                index = items.index(current),
                item;

            if (index === items.length - 1) { // Last item
                if (this.nextColumn(false)) {
                    items = this.$curr_col.find('li').removeClass('current');
                    item = items.get(0);
                    $(item).addClass('current');
                }
            } else {
                if (items.length - 1 > index) { // Assure we have more items
                    items.removeClass('current');
                    item = items.get(index + 1);
                    $(item).addClass('current');
                }
            }

            if (item) {
                var $item = $(item).find('a');
                this.$element.trigger('navigate', [this.$items.index($item.get(0))]);
            }
        },

        nextColumn : function(trigger) {
            var col_index = this.cols.index(this.$curr_col),
                items = this.$curr_col.find('li'),
                current = this.$curr_col.find('.current'),
                index = items.index(current),
                item;

            if (col_index < this.cols.length - 1) {
                // Remove the current selected style
                this.$curr_col.find('li.current').removeClass('current');
                this.$curr_col = this.$curr_col.next('ul,ol');

                // Select the next column
                items = this.$curr_col.find('li');
                index = (index > items.length - 1) ? items.length - 1 : index;
                item = items.get(index);
                $(items.get(index)).addClass('current');

                if (item && trigger !== false) {
                    var $item = $(item).find('a');
                    this.$element.trigger('navigate', [this.$items.index($item.get(0))]);
                }

                return true;
            }
            return false;
        },

        prev : function() {
            var col_index = this.cols.index(this.$curr_col),
                items = this.$curr_col.find('li'),
                current = this.$curr_col.find('.current'),
                index = items.index(current),
                item;

            if (index === 0) {
                if (this.prevColumn(false)) {
                    items = this.$curr_col.find('li').removeClass('current');
                    item = items.get(items.length - 1);
                    $(item).addClass('current');
                }
            } else {
                items.removeClass('current');
                item = items.get(index - 1);
                $(item).addClass('current');
            }

            if (item) {
                var $item = $(item).find('a');
                this.$element.trigger('navigate', [this.$items.index($item.get(0))]);
            }
        },

        prevColumn : function(trigger) {
            var col_index = this.cols.index(this.$curr_col),
                items = this.$curr_col.find('li'),
                current = this.$curr_col.find('.current'),
                index = items.index(current),
                item;

            if (col_index > 0) {
                // Remove the current selected style
                this.$curr_col.find('li.current').removeClass('current');
                this.$curr_col = this.$curr_col.prev('ul,ol');

                // Select the next column
                items = this.$curr_col.find('li');
                index = (index > items.length - 1) ? items.length - 1 : index;
                item = items.get(index);
                $(items.get(index)).addClass('current');

                if (item && trigger !== false) {
                    var $item = $(item).find('a');
                    this.$element.trigger('navigate', [this.$items.index($item.get(0))]);
                }

                return true;

            }
            return false;
        },

        listen : function() {
            var $this = this;
            $(document).on('keyup', function(e) {
                if ($this.options.active) {
                    switch (e.keyCode) {
                        case 37: // LEFT
                            $this.prevColumn();
                            if ($this.options.trapEvent) {
                                e.preventDefault();
                            }
                            break;

                        case 38: // UP
                        case 34: // KEYPAD UP
                            $this.prev();
                            if ($this.options.trapEvent) {
                                e.preventDefault();
                            }
                            break;

                        case 39: // RIGHT
                            $this.nextColumn();
                            if ($this.options.trapEvent) {
                                e.preventDefault();
                            }
                            break;

                        case 40: // DOWN
                        case 35: // KEYPAD DOWN
                            $this.next();
                            if ($this.options.trapEvent) {
                                e.preventDefault();
                            }
                            break;

                        case 13: // ENTER
                            if ($this.$element.is(':visible')) {
                                $this.options.submit.call($this);
                            }
                            break;

                        default:
                        // do nothing
                    }
                }
            });
        },

        getItemByIndex : function(i) {
            return this.$items.get(i);
        },

        disable : function() {
            this.options.active = false;
        },

        enable : function() {
            this.options.active = true;
        }
    };

    $.fn.multilist.defaults = {
        trapEvent : true,
        active : true,
        submit : function() {
            var $dest = this.$curr_col.find('.current a');

            if ($dest && undefined !== $dest.prop('href')) {
                window.location = $dest.prop('href');
            }
        }
    };

    $.fn.multilist.Constructor = MultiList;
}(jQuery));