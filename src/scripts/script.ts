'use strict'
import * as $ from 'jquery';
import SplitButton from './controls/SplitButton';

$(function() {
    let top = 0, topXs = 0, topSm = 0, topMd = 0, topLg = 0, topXl = 0;
    $('.autostick').each(function (_i, el) {
        top += $(el).css('--top', top+'px').outerHeight();
        $(document.documentElement).css('--scroll-top', top+'px');
    });
    $('.autostick, .autostick-xs').each(function(_i, el) {
        topXs += $(el).css('--top-xs', topXs+'px').outerHeight();
        $(document.documentElement).css('--scroll-top-xs', topXs+'px');
    });
    $('.autostick, .autostick-xs, .autostick-sm').each(function(_i, el) {
        topSm += $(el).css('--top-sm', topSm+'px').outerHeight();
        $(document.documentElement).css('--scroll-top-sm', topSm+'px');
    });
    $('.autostick, .autostick-xs, .autostick-sm, .autostick-md').each(function(_i, el) {
        topMd += $(el).css('--top-md', topMd+'px').outerHeight();
        $(document.documentElement).css('--scroll-top-md', topMd+'px');
    });
    $('.autostick, .autostick-xs, .autostick-sm, .autostick-md, .autostick-lg').each(function(_i, el) {
        topLg += $(el).css('--top-lg', topLg+'px').outerHeight();
        $(document.documentElement).css('--scroll-top-lg', topLg+'px');
    });
    $('.autostick, .autostick-xs, .autostick-sm, .autostick-md, .autostick-lg, .autostick-xl').each(function(_i, el) {
        el.dataset.offsetTop = el.offsetTop.toString();
        topXl += $(el).css('--top-xl', topXl+'px').outerHeight();
        $(document.documentElement).css('--scroll-top-xl', topXl+'px');
    });
});
$(window).on('scroll', function() {
    let originalTop = 0;
    let offsetTop = 0;
    $('.autostick, .autostick-xs, .autostick-sm, .autostick-md, .autostick-lg, .autostick-xl').each(function(_i, el) {
        originalTop = Number.parseFloat(el.dataset.offsetTop);
        offsetTop = el.offsetTop;
        el.classList.toggle('autostick--sticked', offsetTop != originalTop);
    });
});

$.extend({
    cookie: function(name) {
        function getCookies() {
            if (!document.cookie) return;
            let cookies = {};
            let cs = document.cookie.split(';');
            for (let i = 0, c, n, v; c = cs[i]; i++) {
                n = c.substring(0, c.indexOf('='));
                v = c.substring(c.indexOf('=')+1);
                cookies[n] = v;
            }
            return cookies;
        }
        let cookies = getCookies();
        return cookies[name];
    },
    csrf: function(token_name, cookie_name) {
        let _$ = this;
        function getTokenHash() {
            return _$.cookie(cookie_name);
        }
        function ajaxPrefilter(opts, oOpts, jqXHR) {
            if (oOpts.data instanceof FormData) {
                oOpts.data.append(token_name, getTokenHash());
            } else {
                opts.data += '&'+token_name+'='+getTokenHash();
            }
        }
        _$(function() {
            _$.ajaxPrefilter(ajaxPrefilter);
            _$(document).on('submit', 'form:not(.ajax)', function(ev) {
                let $this = _$(this);
                let $input = $this.find(':input[name='+token_name+']');
                if ($input.length === 0) {
                    $input = _$('<input type=hidden>').prop('name',token_name);
                    $this.append($input)
                }
                $input.val(getTokenHash());
            });
        });
    },
    hold: function(ms, fn) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(fn.bind(this, ...args), ms || 0);
        }
    }
});

document.addEventListener('DOMContentLoaded', function(e) {
    SplitButton.fromSelector('.split-button');
});

$(function(ev) {
    let $el = $('.textarea[contenteditable]');
    $el.each(function(i, e) {
        let $e = $(e);
        let $ta = $('<textarea>');
        $ta.attr('name', $e.attr('name'));
        $ta.prop('required',$e.attr('required'));
        $ta.hide().appendTo($e.parent());
        $ta.val(e.innerText);
        $e.on('input', function(ev) {
            $ta.val(this.innerText);
        });
    });

    $el = $('.auto-height')
        .each(function(i, el) {
            el.style.height = (el.scrollHeight) + 'px';
            el.style.overflowY = 'hidden';
        }).on('input keypress paste', function(e) {
            this.style.height = (this.scrollHeight) + 'px';
        });

    let selector = 'input[type=checkbox][data-toggle]';
    $(document).on('change', selector, function(ev) {
        let $this = $(this);
        let $toggle = $($this.attr('data-toggle'));
        if ($this.prop('checked')) {
            $toggle.show().find(':input[required]').prop('disabled',false);
        } else {
            $toggle.hide().find(':input[required]').prop('disabled',true);
        }
    })
    $(selector).trigger('change');

    $('body').on('change',':radio', function() {
        let $this = $(this);
        $this.attr('chkd', 'true');
        $this.trigger('check');

        let name = $this.prop('name');
        if (!name) return;
        $(':radio[name='+name+'][chkd]').not($this).removeAttr('chkd').trigger('uncheck');
    });

    $('body').on('change', ':checkbox', function(e) {
        if (this.checked) {
            $(this).trigger('check');
        } else {
            $(this).trigger('uncheck');
        }
    });

    $('body').on('input', '[data-autocheck-fill]', function(e) {
        let $this = $(this);
        let chkId = $this.data('autocheck-fill');
        let $chk = $('#'+chkId);
        $chk.prop('checked', this.value.trim() !== '');
    }).on('change', ':checkbox[data-toggle=disable]', function() {
        let target = $(this).data('target');
        let $target = $(target);
        $target.prop('disabled', !this.checked);
    });

    $(document).on('submit.ajax', 'form.ajax', function(ev) {
        ev.preventDefault();
        let $this = $(this);
        let $submits = $this.find(':submit');
        let $inputs = $this.find(':input:not(:disabled)');
        let method = $this.prop('method');
        let action = $this.prop('action');
        let data = {};
        $inputs.each(function(i, el) {
            if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
                if (el.checked && 'name' in el) {
                    data[el['name']] = ('value' in el ? el['value'] : 'on');
                }
                return;
            }
            if ('name' in el && 'value' in el) {
                data[el['name']] = el['value'];
            }
        });
        $submits.prop('disabled', true);
        $.ajax({
            "type"      : method,
            "url"       : action,
            "data"      : data,
            "complete"  : function(jqXHR) {
                $submits.prop('disabled', false);
                let completeEvent = $.Event('ajax-complete');
                completeEvent['jqXHR'] = jqXHR;
                $this.trigger(completeEvent);
            },
            "error"     : function(jqXHR) {
                let errorEvent = $.Event('ajax-error');
                errorEvent['jqXHR'] = jqXHR;
                $this.trigger(errorEvent);
            },
            "success"   : function(data, textStatus, jqXHR) {
                let successEvent = $.Event('ajax-success');
                successEvent['response'] = data;
                successEvent['textStatus'] = textStatus;
                successEvent['jqXHR'] = jqXHR;
                $this.trigger(successEvent);
            }
        })
    });
});
$(window.document.documentElement).on('click', '.copy-link', function(e) {
    e.preventDefault();
    let $this = $(this);
    let copy = $this.data('copy');
    navigator.clipboard.writeText(copy);
    alert("Se copió '" + copy + "' al portapapeles.");
});
$(window.document.documentElement).on('click', '.post-link', function(e) {
    e.preventDefault();
    let target = this as HTMLAnchorElement;
    let form = document.createElement('form');
    document.documentElement.appendChild(form);
    form.method = 'POST';
    form.action = target.href;
    form.submit();
    document.documentElement.removeChild(form);
});
function groupInputsByName(inputs:HTMLInputElement[]) : Map<string, HTMLInputElement[]> {
    let namesMap = new Map<string, HTMLInputElement[]>();
    inputs.every(el => namesMap[el.name] = []);
    for (const name in namesMap) {
        namesMap.set(name, inputs.filter(v => v.name == name));
    }
    return namesMap;
}
$(function() {
    let checkboxes = $(window.document.documentElement)
        .find('input[type=checkbox][name$="[]"][required]')
        .toArray() as HTMLInputElement[];
    $(checkboxes)
        .addClass('checkbox-group-required')
        .removeAttr('required');
});
/**
 * Disables submit buttons after form sent.
 * 
 * Checks first form validity to prevent disabling when form is uncompleted.
 */
$(window.document.documentElement).on('submit', 'form:not(.ajax-client)', function(e) {
    let $this = $(this);
    let $form = $this.closest('form');
    let form = $form.get(0) as HTMLFormElement;
    let checkboxes = $form.find('.checkbox-group-required').toArray() as HTMLInputElement[];
    let checkboxGroups = groupInputsByName(checkboxes);
    for (const name in checkboxGroups) {
        const checked = checkboxGroups.get(name)?.filter(el => el.checked);
        if (!checked || checked?.length < 1) {
            checkboxGroups.get(name)?.at(0)?.setCustomValidity('Debe seleccionar al menos uno.');
        }
    }

    let checkboxValidity = function (this:HTMLInputElement, e:Event) {
        let chkbxgrp = checkboxGroups.get(this.name);
        chkbxgrp?.at(0)?.setCustomValidity('');
        chkbxgrp?.forEach(el => el.removeEventListener('input', checkboxValidity));
    }

    checkboxes.forEach(el => el.addEventListener('input', checkboxValidity));
    if (!form.reportValidity()) {
        e.preventDefault();
        return false;
    }
    $(':submit').prop('disabled', true);
});
$(window.document.documentElement).on('blur', 'input:not(.no-trim)', function(e) {
    this.value = this.value.trim();
    this.value = this.value.replace(/\s+/g, ' ');
});
$(window.document.documentElement).on('click', '.js-go-back', function(e) {
    e.preventDefault();
    window.history.back();
});