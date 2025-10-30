(function ($) {
    "use strict";

    var pluginName = 'ajaxModal';
    
    /**
     * Retrieves the script tags in document
     * @return {Array}
     */
//    var getPageScriptTags = function () {
//        var scripts = [];
//        jQuery('script[src]').each(function () {
//            scripts.push(jQuery(this).attr('src'));
//        });
//        return scripts;
//    };


    /**
     * Retrieves the CSS links in document
     * @return {Array}
     */
//    var getPageCssLinks = function () {
//        var links = [];
//        jQuery('link[rel="stylesheet"]').each(function () {
//            links.push(jQuery(this).attr('href'));
//        });
//        return links;
//    };

    function AjaxModal(element, options) {
        this.element = element;
        this.options = options;
        this.init(options);
    };

    AjaxModal.DEFAULTS = {
        url: null,
        ajaxSubmit: true,
        titleSelector: '.modal-title',
        loadingHtml: 'loading...',
        pjaxContainer: null,
        modalClass: null,
        modalSize: '',
        errorText: 'An error occurred. Try again please.',
        debug: false
    };

    AjaxModal.prototype.init = function (options) {
        jQuery(this.element).on('show.bs.modal', this.show.bind(this));
        jQuery(this.element).on('shown.bs.modal', this.shown.bind(this));
        jQuery(this.element).on('hide.bs.modal', this.hide.bind(this));
        jQuery(this.element).on('hidden.bs.modal', this.hidden.bind(this));
    };
    
    /**
     * Requests the content of the modal and injects it, called after the
     * modal is shown
     */
    AjaxModal.prototype.show = function (event) {
        var btn = $(event.relatedTarget);
        var title = btn.attr('title') || btn.data('title');
        this.options.modalClass = btn.data('modal-class') || '';
        this.options.pjaxContainer = btn.data('pjax-container') || this.options.pjaxContainer;
        this.options.modalSize = btn.data('modal-size') || '';
        this.options.ajaxSubmit = btn.data('ajax-submit') || this.options.ajaxSubmit;
        if (title) {
            jQuery(this.element).find(this.options.titleSelector).html(title);
        }
        if (this.options.modalSize) {
            jQuery(this.element).find('.modal-dialog').addClass(this.options.modalSize);
        } else {
            jQuery(this.element).find('.modal-dialog').removeClass('modal-lg modal-sm');
        }
        jQuery(this.element).addClass(this.options.modalClass);
    };
    
    AjaxModal.prototype.shown = function (event) {
        var btn = $(event.relatedTarget);
        jQuery(this.element).find('.modal-body').html(this.options.loadingHtml);
        var url = btn.attr('href') || btn.data('url') || this.options.url;
        jQuery.ajax({
            url: url,
            context: this,
            beforeSend: function (xhr, settings) {
                jQuery(this.element).triggerHandler('ajaxmodal:beforeLoad', [xhr, settings]);
            },
            success: function (data, status, xhr) {
                this.injectHtml(data);
                if (this.options.ajaxSubmit) {
                    jQuery(this.element).off('submit').on('submit', this.formSubmit.bind(this));
                }
                jQuery(this.element).triggerHandler('ajaxmodal:afterLoad', [data, status, xhr]);
//                jQuery(this.element).triggerHandler('ajaxmodal:show', [data, status, xhr, this.selector]);
            }
        });
    };
    
    AjaxModal.prototype.hide = function () {
        jQuery(this.element).removeClass(this.options.modalClass);
    };
    
    AjaxModal.prototype.hidden = function () {
        jQuery(this.element).find('.modal-body').html(this.options.loadingHtml);
    };

    /**
     * Injects the form of given html into the modal and extecutes css and js
     * @param  {string} html the html to inject
     */
    AjaxModal.prototype.injectHtml = function (html) {
        // Find form and inject it
//        var form = jQuery(html).filter('form');

//        jQuery(this.element).find('.modal-body').html(form);
        jQuery(this.element).find('.modal-body').html(html);
    };

    /**
     * Adds event handlers to the form to check for submit
     */
    AjaxModal.prototype.formSubmit = function () {
        var form = jQuery(this.element).find('form');
        if (form.data('requestRunning')) {
            return false;
        }
        form.data('requestRunning', true);
        var btn = form.find('button[type="submit"]');
        btn.prop('disabled', true);

        // Convert form to ajax submit
        jQuery.ajax({
            method: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize(),
            context: this,
            beforeSend: function (xhr, settings) {
                jQuery(this.element).triggerHandler('ajaxmodal:beforeSubmit', [xhr, settings]);
            },
            success: function (data, status, xhr) {
                var contentType = xhr.getResponseHeader('content-type') || '';
                if (contentType.indexOf('html') > -1 && data !== '') {
                    // Assume form contains errors if html
                    this.injectHtml(data);
                    status = false;
                }
                jQuery(this.element).triggerHandler('ajaxmodal:afterSubmit', [data, status, xhr, this.options.pjaxContainer]);
            },
            error: function (xhr, settings) {
                if (this.options.debug) {
                    this.injectHtml(xhr.responseText);
                } else {
                    this.injectHtml(this.options.errorText);
                }
            }
        });

        return false;
    };
    
    $.fn[pluginName] = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('ajaxmodal');
            var options = $.extend({}, AjaxModal.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) $this.data('ajaxmodal', (data = new AjaxModal(this, options)));
//            if (typeof option == 'string') data[option]();
            else  {
                options = $.extend($this.data('ajaxmodal').options, typeof option == 'object' && option);
                $this.data('ajaxmodal').options = options;
            }
        });
    };
})(jQuery);
