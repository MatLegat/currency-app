/* include minified money.js */
/* money.js 0.2, MIT license, http://openexchangerates.github.io/money.js */
(function(g,j){var b=function(a){return new i(a)};b.version="0.1.3";var c=g.fxSetup||{rates:{},base:""};b.rates=c.rates;b.base=c.base;b.settings={from:c.from||b.base,to:c.to||b.base};var h=b.convert=function(a,e){if("object"===typeof a&&a.length){for(var d=0;d<a.length;d++)a[d]=h(a[d],e);return a}e=e||{};if(!e.from)e.from=b.settings.from;if(!e.to)e.to=b.settings.to;var d=e.to,c=e.from,f=b.rates;f[b.base]=1;if(!f[d]||!f[c])throw"fx error";d=c===b.base?f[d]:d===b.base?1/f[c]:f[d]*(1/f[c]);return a*d},i=function(a){"string"===typeof a?(this._v=parseFloat(a.replace(/[^0-9-.]/g,"")),this._fx=a.replace(/([^A-Za-z])/g,"")):this._v=a},c=b.prototype=i.prototype;c.convert=function(){var a=Array.prototype.slice.call(arguments);a.unshift(this._v);return h.apply(b,a)};c.from=function(a){a=b(h(this._v,{from:a,to:b.base}));a._fx=b.base;return a};c.to=function(a){return h(this._v,{from:this._fx?this._fx:b.settings.from,to:a})};if("undefined"!==typeof exports){if("undefined"!==typeof module&&module.exports)exports=module.exports=b;exports.fx=fx}else"function"===typeof define&&define.amd?define([],function(){return b}):(b.noConflict=function(a){return function(){g.fx=a;b.noConflict=j;return b}}(g.fx),g.fx=b)})(this);

/* App.js */

// object to handle currency acronyms
var currencies = {
    fromCurr: "AUD",
    toCurr: "AUD"
}

var favorites = [];

if (localStorage.getItem("favorites") !== null) {
    favorites = JSON.parse(localStorage.getItem("favorites"));
    generateFavoritesList();
}

$.getJSON("https://api.fixer.io/latest", function(data) {
    if (typeof fx !== "undefined" && fx.rates) {
        fx.rates = data.rates;
        fx.base = data.base;
    } else {
        var fxSetup = {
            rates: data.rates,
            base: data.base
        }
    }
});

// returns the index of item in favorites list
function searchForArray(haystack, needle){
    var i, j, current;
    for (i = 0; i < haystack.length; ++i) {
        if (needle.length === haystack[i].length) {
            current = haystack[i];
            for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
            if (j === needle.length)
                return i;
        }
    }

    return -1;
}

function generateFavoritesList() {
    var list = $('#favorites-list');
    var listParent = list.parent();

    // append each favorite to list item
    list.empty().each(function(i) {
        for (var x = 0; x < favorites.length; x++) {
            $(this).append('<li>' + $.i18n('cc-to-currency', favorites[x][0], favorites[x][1]) + '<i class="icon-trash-empty delete-icon" aria-hidden="true"></i></li>');
            if (x == favorites.length - 1) {
                $(this).appendTo(listParent);
            }
        }
    });

    // show number of favorites in list
    if (favorites.length === 0) {
        $('.favorites-message').text($.i18n("cc-no-fav"));
    } else {
        $('.favorites-message').text($.i18n("cc-fav-count", favorites.length));
    }
}

function updateResults() {

    var fromCurr = currencies.fromCurr;
    var toCurr = currencies.toCurr;

    var formatter = Intl.NumberFormat($.i18n().locale, {minimumFractionDigits: 2, maximumFractionDigits: 2});

    var fromAmount = formatter.format($('#from-entry').val());
    var converted = formatter.format(fx.convert(parseFloat(fromAmount), {from: fromCurr, to: toCurr}));

    $('#success-message').empty();
    if (fromAmount !== "") {
        $('#results').removeAttr('hidden');
        $('#from-result').text($.i18n('cc-equals-value', fromAmount, $.i18n(fromCurr, fromAmount)));
        $('#to-result').text($.i18n(toCurr, converted));
    } else {
        $('#results').attr('hidden', true);
    }
}

$(function() {

    $('.from-currency-modal').on('click', '.currency-label', function() {
        currencies.fromCurr = $(this).text();
        $('.btn-from-currency').html('<span class="flag-icon flag-icon-' + currencies.fromCurr.toLowerCase().substr(0, 2) + '"></span>' + currencies.fromCurr);
        $('.from-currency-modal').modal('hide');
        updateResults();
    });

    $('.to-currency-modal').on('click', '.currency-label', function() {
        currencies.toCurr = $(this).text();
        $('.btn-to-currency').html('<span class="flag-icon flag-icon-' + currencies.toCurr.toLowerCase().substr(0, 2) + '"></span>' + currencies.toCurr);
        $('.to-currency-modal').modal('hide');
        updateResults();
    });

    // delete individual item from favorites
    $('#favorites-list').on('click', 'li .delete-icon', function() {
        favorites.splice($(this).index(), 1);
        generateFavoritesList();
    });

    // go back to landing page on header click
    $('.header h3').not('#globe').click(function() {
        $('#conversion').attr('hidden', true);
        $('#favorites').attr('hidden', true);
        $('#results').attr('hidden', true);
        $('#intro').removeAttr('hidden');
    });

    // go to conversion screen
    $('.convert-btn').click(function() {
        $('#from-entry').val('');
        $('#conversion').removeAttr('hidden');
        $('#intro').attr('hidden', true);
        $('#favorites').attr('hidden', true);
        $('#results').attr('hidden', true);
    });

    // show favorites screen
    $('.show-favorites').click(function() {
        generateFavoritesList();
        $('#favorites').removeAttr('hidden');
        $('#intro').attr('hidden', true);
        $('#conversion').attr('hidden', true);
        $('#results').attr('hidden', true);
    });

    // add new favorite from conversion screen
    $('#favorite-btn').on('click', function(e) {
        e.preventDefault();
        var fromCurr = currencies.fromCurr;
        var toCurr = currencies.toCurr;
        $('#success-message').fadeIn('fast');
        // check if item already exists in favorites
        if (searchForArray(favorites, [fromCurr, toCurr]) === -1) {
            favorites.push([fromCurr, toCurr]);
            $('#success-message').html('<i style="color: green" class="icon-ok-circled" aria-hidden="true"></i>       ' + $.i18n('cc-fav-added', fromCurr, toCurr));
        } else {
            $('#success-message').html('<i style="color: red" class="icon-cancel" aria-hidden="true"></i>       ' + $.i18n('cc-fav-exists'));
        }
        setTimeout(function() {
            $('#success-message').fadeOut('fast');
        }, 2000);
        generateFavoritesList();
    });

    // delete all favorites
    $('#delete-favorites').click(function() {
        localStorage.removeItem("favorites");
        favorites = [];
        generateFavoritesList();
    });

    // update conversion results on input
    $('#from-entry').on('input', updateResults);

    // set localStorage item before browser window closes
    $(window).on('beforeunload', function() {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    });

    // language selector
    $.ajax({
        dataType: "json",
        url: "i18n/available_languages.json",
        mimeType: "application/json",
        success: function(result){
            var userLang = localStorage.getItem("lang") || navigator.language || navigator.userLanguage;
            var languageSet = false;
            $.i18n().locale = 'en';
            result.forEach(function(language) {
                $('#language-list').append(
                    $('<li>')
                    .attr('id', language.id)
                    .attr('onclick', 'setLanguage("' + language.id + '")')
                    .append(
                        language.name
                    )
                );
                $.i18n().load({
                    [language.id]: ("i18n/" + language.file)
                }).done(function() {
                    if (language.id == userLang || (language.id == 'en' && $.i18n().locale == 'en')) {
                        setLanguage(language.id);
                    }
                });
            });
        }
    });

    $('#language-button').click(function() {
        if ($('#language-list').css('display') == 'none') {
            $('#language-list').show(200);
        } else {
            $('#language-list').hide(200);
        }
    });

});

function setLanguage(id) {
    localStorage.setItem('lang', id);
    $.i18n().locale = id;
    $('html').attr('lang', id);
    $('html').i18n();
    $('html').attr('dir', $.i18n('dir'));
    $('#language-list').hide(200);
    $('.selected').removeClass('selected');
    $('#language-list #' + id).addClass('selected');
    if (!$('#results').attr('hidden')) {
        updateResults();
    }
}
