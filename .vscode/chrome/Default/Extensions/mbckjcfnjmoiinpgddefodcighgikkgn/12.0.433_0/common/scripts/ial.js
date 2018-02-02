/*******************************************************************************
 *
 *  avast! Online Security plugin
 *  (c) 2013 Avast Corp.
 *
 *  @author: Lucian Corlaciu
 *
 *  Injected Core - cross browser
 *
 ******************************************************************************/

(function($, EventEmitter) {

  if (typeof AvastWRC == 'undefined') { AvastWRC = {}; }//AVAST Online Security

  AvastWRC.ial = AvastWRC.ial || {
    /**
     * Background script instance - browser specific
     * @type {Object}
     */
    bs: null,
    /**
     * DNT settings used to determine if a page needs to be refreshed or not
     * @type {Object}
     */
    _CHANGED_FIELDS: {},
    /**
     * Initialization
     * @param  {Object} _bs instance of browser specifics
     * @return {Object} AvastWRC.ial instance - browser agnostic
     */
    init: function(_bs){
      this.bs = _bs;
      //this.initPage();
      this.attachHandlers();
      this.bs.messageHandler('initMe');

      return this;
    },
    /**
     * EventEmitter instance to hangle injected layer events.
     * @type {Object}
     */
    _ee: new EventEmitter(),

    _isOldGui : true,
    /**
     * Register events with instance of EventEmitter.
     * @param  {Object} callback to register with instance of eventEmitter
     * @return {void}
     */
    registerEvents: function(registerCallback, thisArg) {
      if (typeof registerCallback === 'function') {
        registerCallback.call(thisArg, this._ee);
      }
    },
    /**
     * Initializes the page where this script is injected
     * @return {void}
     */
    initPage: function() {
      if($('head').length === 0) {
        $('html').prepend("<head></head>");
      }
      AvastWRC.ial.injectFonts();     
    },
    /**
     * Injects custom fonts
     * @return {void}
     */
    injectFonts: function() {
      if($('#avast_os_ext_custom_font').length === 0) {
        $('head')
          .append("<link id='avast_os_ext_custom_font' href='//fonts.googleapis.com/css?family=Source+Sans+Pro' rel='stylesheet' type='text/css'>")
          .append("<link href='//fonts.googleapis.com/css?family=Lato:400,900' rel='stylesheet' type='text/css'>")
          .append("<link href='//fonts.googleapis.com/css?family=Open+Sans:300,400,700&subset=latin,latin-ext' rel='stylesheet' type='text/css'>")
          .append("<link href='//fonts.googleapis.com/css?family=Gloria+Hallelujah' rel='stylesheet' type='text/css'>")
          .append("<link href='//fonts.googleapis.com/css?family=Roboto:400,500' rel='stylesheet' type='text/css'>");
        }
    },
    /**
     * Message hub - handles all the messages from the background script
     * @param  {String} message
     * @param  {Object} data
     * @param  {Function} reply
     * @return {void}
     */
    messageHub: function(message, data, reply) {
      // emit messages in specific namespace
      this._ee.emit('message.' + message, data, reply);
    },
    /**
     * Reinitialize the page. Handle 'reInit' message from background.
     */
    reInitPage: function (data) {
      AvastWRC.ial.initPage();
      AvastWRC.ial.attachHandlers();
    },
    /**
     * Attaches DOM handlers
     * @return {void}
     */
    attachHandlers: function() {
      typeof $ !== 'undefined' && $(document).ready(function() {
        window.onunload = AvastWRC.ial.onUnload;     
      });
    },
    /**
     * Notifies the background script
     * @return {void}
     */
    onUnload: function() {
      AvastWRC.ial.bs.messageHandler('unload');
    },
    /**
     * Hides the message box, if present, and restores the page to its initial state
     * @return {void}
     */
    clearBoxes: function() {
      $("body").removeClass("avast-overlay-on").removeClass("avast-bar-on").removeClass("avast-install-on");
    },
    /**
     * Retrive the top element of the page.
     * See: http://stackoverflow.com/questions/10100540/chrome-extension-inject-sidebar-into-page
     * @return retrieved top element to inject ext. HTML into
     */
    getTopHtmlElement: function () {
      var docElement = document.documentElement;
      if (docElement) {
        return $(docElement); //just drop $ wrapper if no jQuery
      } else {
        docElement = document.getElementsByTagName('html');
        if (docElement && docElement[0]) {
          return $(docElement[0]);
        } else {
          docElement = $('html');
          if (docElement.length > -1) {//drop this branch if no jQuery
            return docElement;
          } else {
            throw new Error('Cannot insert the bar.');
          }
        }
      }
    },

    /**
     * Create a top bar instance
     * @param {String} bar template HTML to be injected
     * @param {String} selector of the injected bar template
     * @param {String} bar height styling ('40px')
     * @return {Object} a wrapper for the bar
     */
    topBar: function (barHtml, barElementSelector, barHeight, topBarRules) {
        var _oldHtmlTopMargin = null;
	      var _oldGoogleTopElem = [];
        var _oldFixed = [];

        AvastWRC.ial.getTopHtmlElement().prepend(barHtml);

        return {
          /**
           * Display the bar.
           */
            show: function () {
                $(barElementSelector).css({top: '0px', left: '0px'});
                // slide page down
                AvastWRC.ial.getTopHtmlElement().css('margin-top',
                  function (index, value) {
                      _oldHtmlTopMargin =  value;
                      return barHeight;
                  }
                );
                if (!RegExp("^http(s)?\\:\\/\\/\\www\\.chase\\.com\\/?").test(document.URL)){
                  // fix for elements with position fixed
                  $("*").each(function(){
                      var $node = $(this);
                      if($node[0].className == -1){
                        if($node.css("position") == "fixed") {
                            var top = parseInt($node.css("top"));
                            if(typeof(top) == "number" && !isNaN(top)) {
                                var newValue = top + parseInt(barHeight);
                                newValue += "px";
                                $node.css("top", newValue);
                                _oldFixed.push({$node : $node, top: top});
                            }
                        }
                      }
                  });
                }
                
                var appliedRule = 0;
                if(topBarRules != null && topBarRules != undefined && topBarRules.rulesToApply >0 && topBarRules.specifics != []){
                    $(topBarRules.specifics).each(function(i,specific) {
                        if(topBarRules.rulesToApply > appliedRule){
                          var propVal = 0;
                          var newValue = 0;
                          if(specific.computedStyle){
                            var elem = document.getElementsByClassName(specific.styleName);
                            if(elem[0]){
                              propVal = window.getComputedStyle(elem[0], specific.computedStyle).getPropertyValue(specific.styleProperty);
                            }                            
                          }
                          else{
                            propVal = parseInt($(specific.styleName).css(specific.styleProperty));
                          }

                        if (specific.dynamicValue) {
                            propVal = specific.dynamicOldValue;
                            newValue = specific.dynamicValue;
                          } else if (propVal == "auto"){
                            newValue = parseInt(barHeight);
                            newValue += "px";
                          }
                          else{
                            propVal = parseInt(propVal);
                            if(typeof(propVal) == "number" && !isNaN(propVal)) {
                              newValue = propVal + parseInt(barHeight);
                              newValue += "px";
                            }
                          }
                          if(newValue != 0){
                            if(specific.computedStyle){
                              var rule = "." + specific.styleName + "::" + specific.computedStyle;
                              var value = specific.styleProperty + ": " +newValue;

                                try {
                                    document.styleSheets[0].insertRule(rule + ' { ' + value + ' }', 0);
                                } catch (e) {
                                    console.log(e);
                                }

                              _oldGoogleTopElem.push({styleName: specific.styleName, 
                                                      styleProperty: specific.styleProperty,
                                                      computedStyle: specific.computedStyle,
                                                      oldValue: propVal});
                              appliedRule ++;	
                            }
                            else{
                              $(specific.styleName).css(specific.styleProperty, newValue);
                              _oldGoogleTopElem.push({styleName: specific.styleName, 
                                                      styleProperty: specific.styleProperty,
                                                      oldValue: propVal});
                              appliedRule ++;	
                            }
                          }                      
                        }							                
                    });
                } 
                return true;  
            },
          /**
           * Remove/close the top bar and reset relevant CSS.
           */
            remove: function() {
                $(barElementSelector).remove();
                // restore page position
                if (_oldHtmlTopMargin)
                    AvastWRC.ial.getTopHtmlElement().css('margin-top', _oldHtmlTopMargin);

                // revert altered fixed positions.
                if(_oldFixed.length > 0){
                    for(var i=0, j=_oldFixed.length; i<j; i++){
                        _oldFixed[i].$node.css("top",_oldFixed[i].top+"px");
                    }
                }
                if(_oldGoogleTopElem != null){
                    for(var i=0, j=_oldGoogleTopElem.length; i<j; i++){
                      if(_oldGoogleTopElem[i].computedStyle){
                        var rule = "." + _oldGoogleTopElem[i].styleName + "::" + _oldGoogleTopElem[i].computedStyle;
                        var value = _oldGoogleTopElem[i].styleProperty + ": " + _oldGoogleTopElem[i].oldValue;

                          try {
                              document.styleSheets[0].insertRule(rule + ' { ' + value + ' }', 0);
                          } catch (e) {
                              console.log(e);
                          }
                      }
                      else{
                          $(_oldGoogleTopElem[i].styleName).css(_oldGoogleTopElem[i].styleProperty, _oldGoogleTopElem[i].oldValue + (_oldGoogleTopElem[i].oldValue === "" ? "" : "px"));
                      }                        
                    }
                }
            }
        };
    }, 

    /**
     * Create the button effect
     */

    addRippleEffect: function (e, buttonClassName) {
      if(!buttonClassName) return false;
      var target = e.target;
      if (target.className.toLowerCase() !== buttonClassName) return false;
        var rect = target.getBoundingClientRect();
        var ripple = target.querySelector('.avast-sas-ripple');
        if (!ripple) {
            ripple = document.createElement('div');
            var max = Math.floor(Math.max(rect.width, rect.height)/2);
            ripple.style.setProperty("height", max + "px", "important");
            ripple.style.setProperty("width", max + "px", "important");
            ripple.className = 'avast-sas-ripple';
            target.appendChild(ripple);
        }
        ripple.style.setProperty("zIndex", "-1", "important");
        var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
        var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
        ripple.style.setProperty("top", top + "px", "important");
        ripple.style.setProperty("left", left + "px", "important");
        return false;
    },
    
  }; // AvastWRC.ial

  AvastWRC.ial.registerEvents(function(ee) {
    ee.on('message.reInit',          AvastWRC.ial.reInitPage);
  });

}).call(this, $, EventEmitter2);

/*******************************************************************************
 *
 *  avast! Online Security plugin
 *  (c) 2014 Avast Corp.
 *
 *  @author:
 *
 *  Injected Layer - SafePrice - cross browser
 *
 ******************************************************************************/

(function($) {

  var SAFESHOP_REFRESH_INTERVAL = 45 * 60 * 1000;

  var safeShopRefreshIID = null;

  if (typeof AvastWRC === 'undefined' || typeof AvastWRC.ial === 'undefined') {
    console.error('AvastWRC.ial instance not initialised to add SafePrice component');
    return;
  } else if (typeof AvastWRC.ial.sp !== 'undefined') {
    return;
  }

  AvastWRC.ial.sp = {

    /**
     * Check the current page using the received selector.
     * @param {Object} page related data
     */
    checkSafeShop: function (data) {
      var safeShopData = $.extend({ scan: null }, data);
      if(data.csl){
        switch (data.providerId) {
          case "ciuvo":
            var ciuvoCoupons = false, ciuvoSearch = false;
            safeShopData.csl.plugins.forEach(function(element) {
              if(element.indexOf("CiuvoSearch") > -1){
                ciuvoSearch = true;
              }
              else if(element.indexOf("VoucherSearch") > -1){
                ciuvoCoupons = true;
              }
            }, this);
            if(ciuvoSearch){ // 
              // product scan - to retrieve page data
              AvastWRC.ial.productScan(data.csl, function(response) {
                safeShopData.scan = response;
                safeShopData.referrer = document.referrer;
                AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
              });
            }else if(ciuvoCoupons){ 
              safeShopData.scan = "ONLY COUPONS: Site not parsed (only VoucherSearch)";
              safeShopData.referrer = document.referrer;
              AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
            }
            break;
          case "comprigo":
            // product scan - to retrieve page data
            AvastWRC.ial.comprigoRun(data.csl, data.url, function(response) {
              safeShopData.scan = response;
              safeShopData.referrer = document.referrer;
              AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
            });
            break;
          /*case "firstOffer":
            // product scan - to retrieve page data
            AvastWRC.ial.runScrapper(data.csl, function(response) {
              safeShopData.scan = response;
              safeShopData.referrer = document.referrer;
              AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
            });
            break;*/
        }
      }else if(safeShopData.onlyCoupons){ 
        safeShopData.scan = "ONLY COUPONS: Site not parsed (no selector)";
        safeShopData.referrer = document.referrer;
        AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
      }      
    },

    createSafeShopBarCoupon : function(data) {
      this.createSafeShopBar(data);
    },

    /**
     * Creates UI for the Top Bar (SafeZone)
     * @param  {Object} data
     * @return {[type]}
     */
    createSafeShopBar: function(data) {
      var pop_elements = ['#avast-sas-offers-drop','#avast-sas-coupons-drop','#avast-sas-accommodations-drop',
        '#avast-sas-help-drop','#avast-sas-settings-drop', '#avast-sas-rate-modal-power', '#avast-sas-rate-modal-glad', '#avast-sas-rate-modal-sorry'];
            
      function toggleBlockShow (id) { 
          $(id).toggleClass('avast-sas-drop-show'); 
          var closed_element_id = id.substr(0, id.indexOf("-drop"));
          if (id.indexOf("offers") != -1 || id.indexOf("coupons") != -1 || id.indexOf("accommodations") != -1){
              $(closed_element_id + " i").toggleClass('avast-sas-shut-icon');
          }                    
      }
      
      function toggleBlockOnBoarding (id) {
        var duaration = 200;
        function animateBestOfferText(){
          if($("#avast-sas-hint-best-offer>h3")[0]){
            $("#avast-sas-hint-best-offer>h3").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $("#avast-sas-hint-best-offer>p").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $(".avast-sas-best-offer-button, .avast-sas-first-offer-button").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }
          else if($("#avast-sas-hint-best-offer>p")[0]){
            $("#avast-sas-hint-best-offer>p").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $(".avast-sas-best-offer-button, .avast-sas-first-offer-button").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }
          else if($(".avast-sas-best-offer-button")[0]){
            $(".avast-sas-best-offer-button").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
            $(".avast-sas-first-offer-button").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }
          else if($(".avast-sas-first-offer-button")[0]){
            $(".avast-sas-first-offer-button").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else animateComparePriceHint();        
        }
  
        function animateComparePriceText(){
          if($("#avast-sas-hint-compare-prices>h3")[0]){
            $("#avast-sas-hint-compare-prices>h3").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $("#avast-sas-hint-compare-prices>p").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $("#avast-sas-accommodations.avast-sas-drop-offers-block, #avast-sas-offers.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else if($("#avast-sas-hint-compare-prices>p")[0]){
            $("#avast-sas-hint-compare-prices>p").animate({opacity: 1}, {easing: "swing", duration: duaration});
            $("#avast-sas-accommodations.avast-sas-drop-offers-block, #avast-sas-offers.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else if($("#avast-sas-accommodations.avast-sas-drop-offers-block")[0]){
            $("#avast-sas-accommodations.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
            $("#avast-sas-offers.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else if($("#avast-sas-offers.avast-sas-drop-offers-block")[0]){
            $("#avast-sas-offers.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else animateCouponHint();
        }   
        function animateCouponText(){
          if($("#avast-sas-hint-coupons>h3")[0]){
            $("#avast-sas-hint-coupons>h3").animate({opacity: 1}, {easing: "swing",  duration: duaration});
            $("#avast-sas-hint-coupons>p").animate({opacity: 1}, {easing: "swing",  duration: duaration});
            $("#avast-sas-coupons.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }
          else if($("#avast-sas-hint-coupons>p")[0]){
            $("#avast-sas-hint-coupons>p").animate({opacity: 1}, {easing: "swing",  duration: duaration});
            $("#avast-sas-coupons.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }
          else if($("#avast-sas-coupons.avast-sas-drop-offers-block")[0]){
            $("#avast-sas-coupons.avast-sas-drop-offers-block").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
          }else animateSettingsHint();
        }
        function animateSettingsText(){
          $("#avast-sas-hint-settings>h3, #avast-sas-hint-settings>p").animate({opacity: 1}, {easing: "swing", duration: duaration});
          $("#avast-sas-settings.avast-sas-settings>i").fadeTo(duaration/2, 0.2, "swing").fadeTo(duaration/2, 1.0, "swing");
        }
        function animateBestOfferHint(){
          if(!$("#avast-sas-hint-best-offer")[0]){
            animateComparePriceHint();
            return;
          }
          $("#avast-sas-hint-best-offer").animate({ top: "0px"}, {easing: "swing", queue: true, duration: duaration, complete: animateBestOfferText});
          $("#avast-sas-hint-best-offer").animate({opacity: 1}, {easing: "swing", queue: false, duration: duaration});
        }
        function animateComparePriceHint(){
          if(!$("#avast-sas-hint-compare-prices")[0]){
            animateCouponHint();
            return;
          }
          $("#avast-sas-hint-compare-prices").animate({ top: "0px"}, {easing: "swing", queue: true, duration: duaration, complete: animateComparePriceText});
          $("#avast-sas-hint-compare-prices").animate({opacity: 1}, {easing: "swing", queue: false, duration: duaration});
        }   
        function animateCouponHint(){
          if(!$("#avast-sas-hint-coupons")[0]){
            animateSettingsHint();
            return;
          }
          $("#avast-sas-hint-coupons").animate({ top: "0px"}, {easing: "swing", queue: true, duration: duaration, complete: animateCouponText});
          $("#avast-sas-hint-coupons").animate({opacity: 1}, {easing: "swing", queue: false, duration: duaration});
        }
        function animateSettingsHint(){
          $("#avast-sas-hint-settings").animate({ top: "0px"}, {easing: "swing", queue: true, duration: duaration, complete: animateSettingsText})
          $("#avast-sas-hint-settings").animate({opacity: 1}, {easing: "swing", queue: false, duration: duaration});
        }
        function startHintAnimations(){ 
          $("#avast-sas-help-drop").toggleClass('avast-sas-drop-show');
          $("#avast-sas-help-drop").css("display", "");    
          $("#avast-sas-help-drop").css("opacity", "");

          animateBestOfferHint();
          setTimeout(function() {
            animateComparePriceHint();
            setTimeout(function() {
              animateCouponHint();
              setTimeout(function() {
                animateSettingsHint();
              }, duaration/2);
            }, duaration/2);
          }, duaration/2);

        }

        if($("#avast-sas-hint-best-offer")[0]){
          $("#avast-sas-hint-best-offer").css("top","130px");
          $("#avast-sas-hint-best-offer").css({ opacity: 0 });
          $("#avast-sas-hint-best-offer>h3").css({ opacity: 0 });
          $("#avast-sas-hint-best-offer>p").css({ opacity: 0 });
        }
        if($("#avast-sas-hint-compare-prices")[0]){
          $("#avast-sas-hint-compare-prices").css("top","130px");
          $("#avast-sas-hint-compare-prices").css({ opacity: 0 });
          $("#avast-sas-hint-compare-prices>h3").css({ opacity: 0 });
          $("#avast-sas-hint-compare-prices>p").css({ opacity: 0 });
        }
        if($("#avast-sas-hint-coupons")[0]){
          $("#avast-sas-hint-coupons").css("top","130px");
          $("#avast-sas-hint-coupons").css({ opacity: 0 });
          $("#avast-sas-hint-coupons>h3").css({ opacity: 0 });
          $("#avast-sas-hint-coupons>p").css({ opacity: 0 });
        }
        if($("#avast-sas-hint-settings")[0]){
          $("#avast-sas-hint-settings").css("top","130px");
          $("#avast-sas-hint-settings").css({ opacity: 0 });
          $("#avast-sas-hint-settings>h3").css({ opacity: 0 });
          $("#avast-sas-hint-settings>p").css({ opacity: 0 });
        }
        $(id).hide().css('opacity', 0).slideDown({easing: "swing", queue: false, duration: duaration, complete: startHintAnimations}).animate({ opacity: 1}, {easing: "swing", queue: false, duration: duaration});          
      }

      function showBlock (id) {
        $(id).addClass('avast-sas-drop-show');
        if(id.indexOf("-help-drop") != -1){
          $('#avast-sas-help').addClass('help-hover');
        }
        if(id.indexOf("-settings-drop") != -1){
          $('#avast-sas-settings').addClass('settings-hover');
        }
        if(id.indexOf("-offers-drop") != -1){
          $('#avast-sas-offers').addClass('drop-hover');
        }
        if(id.indexOf("-accommodations-drop") != -1){
          $('#avast-sas-accommodations').addClass('drop-hover');
        }
        if(id.indexOf("-coupons-drop") != -1){
          $('#avast-sas-coupons').addClass('drop-hover');
        }

      }

      function hideBlock (id) {
        $(id).removeClass('avast-sas-drop-show'); 
        var closed_element_id = id.substr(0, id.indexOf("-drop"));
        if (id.indexOf("offers") != -1 || id.indexOf("coupons") != -1 || id.indexOf("accommodations") != -1){
          $(closed_element_id + " i").removeClass('avast-sas-shut-icon');
        } 
        if(id.indexOf("-help-drop") != -1){
          $('#avast-sas-help').removeClass('help-hover');
        }
        if(id.indexOf("-settings-drop") != -1){
          $('#avast-sas-settings').removeClass('settings-hover');
        }
        if(id.indexOf("-offers-drop") != -1){
          $('#avast-sas-offers').removeClass('drop-hover');
        }
        if(id.indexOf("-accommodations-drop") != -1){
          $('#avast-sas-accommodations').removeClass('drop-hover');
        }
        if(id.indexOf("-coupons-drop") != -1){
          $('#avast-sas-coupons').removeClass('drop-hover');
        }
      }

      function feedback (data) {
        AvastWRC.ial.bs.messageHandler('safeShopFeedback', data);
      }

      function showBlockExcl (id) {
        if(id.indexOf("#avast-sas-help-drop") != -1){
          toggleBlockOnBoarding(id);
        }else{
          toggleBlockShow(id);
        }        
        for (var i=0; i < pop_elements.length; i++) {
          if (id !== pop_elements[i]) {
            hideBlock(pop_elements[i]);
          }
        }
      }

      function alignPosition(elementSel, alignToSel, toRight, offset) {
        var $elm = $(elementSel);
        var $aTo = $(alignToSel);
        if ($elm.length && $aTo.length) {
          var pos = $aTo.position().left;
          if (toRight) {
            pos += $aTo.width();
          }
          $elm.css('left', pos + offset + 'px');
        }
      }

      function helpShow (event) {
        if (event){
          event.stopPropagation();
          if(event.currentTarget.id.indexOf("avast-sas-help") != -1) {
            data.helpShow = true;
          }
        }
        if(document.getElementsByClassName('settings-hover').length != 0){
          $('#avast-sas-settings').removeClass('settings-hover');
        }
        if(document.getElementsByClassName('help-hover').length == 0){
          $('#avast-sas-help').addClass('help-hover');
        }
        else{
          $('#avast-sas-help').removeClass('help-hover');
        }

        var buttonWidth = parseInt($('.avast-sas-best-offer-button').width());
        if(buttonWidth < 328){
          $('.avast-sas-hint-message').css("visibility","hidden");
        }
        if(data.hotelSearchPage){
          alignPosition('#avast-sas-hint-best-offer', '#avast-sas-best-offer-link>div', true, -200);
        }
        else{
          alignPosition('#avast-sas-hint-best-offer', '#avast-sas-best-offer-link>div', true, -330);
        }
        if($('#avast-sas-offers').length){
          alignPosition('#avast-sas-hint-compare-prices', '#avast-sas-offers', false, -383);
          alignPosition('#avast-sas-hint-coupons', '#avast-sas-coupons', false, -540);
        }
        else if($('#avast-sas-accommodations').length){
          alignPosition('#avast-sas-hint-compare-prices', '#avast-sas-accommodations', false, -383);
          alignPosition('#avast-sas-hint-coupons', '#avast-sas-coupons', false, -540);
        }
        else{
          alignPosition('#avast-sas-hint-coupons', '#avast-sas-coupons', false, -230);
        }

        showBlockExcl('#avast-sas-help-drop');

        $(".avast-sas-hide").bind("click", helpConfirm );
      }

      function helpAction (event, optin) {
        event.stopPropagation();
        var showOnboardingPage = data.showOnboardingPage;
        var helpShow = data.helpShow;
        data.showOnboardingPage = false;
        data.helpShow = false;
        $(".avast-sas-hide").unbind("click", helpConfirm );
        feedback({
          type: 'safeShopOptin',
          optin: optin,
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          showOnboardingPage: showOnboardingPage,
          helpShow: helpShow,
          referrer: data.referrer || ""
         });
        hideBlock('#avast-sas-help-drop');
        //activate the drop down again cause was deactivate on onboarding
        if(showOnboardingPage){
          dropControl('#avast-sas-offers', '#avast-sas-offers-drop');
          dropControl('#avast-sas-coupons', '#avast-sas-coupons-drop');
          dropControl('#avast-sas-accommodations', '#avast-sas-accommodations-drop');
        }
      }

      function helpConfirm (event) {
        helpAction(event, true);
      }

      function helpCancel (event) {
        helpAction(event, false);
        bar.remove();
      }

      function dropControl (buttonId, dropId) {
        var active = false;
        var timeoutId = null;

        function hideOnTimeout () {
          hideBlock(dropId);
          timeoutId = null;
          active = false;
        }

        function hoverIn (e) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          } else {
            showBlockExcl(dropId);
            $(dropId).css('left', $(buttonId).position().left+'px');
            active = true;
          }
        }

        function hoverOut (e) {
          if (!timeoutId && active) {
            timeoutId = setTimeout(hideOnTimeout, 200);
          }
        }
        if(!data.showOnboardingPage){
          $(buttonId).hover(hoverIn, hoverOut);
          $(buttonId).click( function(e) {
            if (active) {
              hideBlock(dropId); active = false;
            } else {
              showBlockExcl(dropId);
              $(dropId).css('left', $(buttonId).position().left+'px');
            }
          });
          $(dropId).hover(hoverIn, hoverOut);
        }
      }

      function setListToWidestChild(selector) {
          let maxWidth = getWidestElementFromList(selector);

          $(selector).each(function () {
              $(this).width(maxWidth);
          });

          function getWidestElementFromList(selector) {
              let width = -1;

              $(selector).each(function () {
                  width = $(this).width() > width ? $(this).width() : width;
              });

              return width;
          }
      }

      function alignSettingsDropdown() {
          setListToWidestChild(".avast-sas-settings-list.individial-setting-show");
          alignPosition("#avast-sas-settings-drop", "#avast-sas-settings", true, -$("#avast-sas-settings-drop").width());
      }

      var bar;
      var domain = data.domain;

      AvastWRC.ial.initPage();

      if($('.avast-extension-safeshop-bar').length > 0) {
        return;
      }

      var height = 51;
      bar = AvastWRC.ial.topBar(
        Mustache.render(AvastWRC.Templates.safeShopBar, data),
        '.avast-extension-safeshop-bar',
        height+'px',
        data.topBarRules
      );

      dropControl('#avast-sas-offers', '#avast-sas-offers-drop');
      dropControl('#avast-sas-coupons', '#avast-sas-coupons-drop');
      dropControl('#avast-sas-accommodations', '#avast-sas-accommodations-drop');

      $('#avast-sas-help').click(function(e) {
        if(!data.showOnboardingPage){
          helpShow(e);
        }
      });
      $('.avast-sas-settings').hover(function(){
          
        }, function(){
          $('avast-sas-settings').removeClass('settings-hover');
          hideBlock('#avast-sas-settings-drop');
      });

      $('#avast-sas-settings').click(function(e) {
        if(!data.showOnboardingPage){
          showBlockExcl('#avast-sas-settings-drop');
          alignSettingsDropdown();
          if(document.getElementsByClassName('help-hover').length != 0){
            $('#avast-sas-help').removeClass('help-hover');
          }
          if(document.getElementsByClassName('settings-hover').length == 0){
            $('#avast-sas-settings').addClass('settings-hover');
          }
          else{
            $('#avast-sas-settings').removeClass('settings-hover');
          }
          $("body").bind("click", function(){
            hideBlock('#avast-sas-settings-drop');
          });
        }
      });

      $('#avast-sas-close').click(function() {
        feedback({
          type: 'avast-sas-close',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          referrer: data.referrer || ""
        });        
        bar.remove();
      });

      $('#avast-sas-disable').click(function() {
        feedback({
          type: 'avast-sas-disable',
          referrer: data.referrer || ""
        });
        bar.remove();
        AvastWRC.ial.bs.messageHandler('disableSafeshop');
      });

      $('#avastpay-checkbox').click(function() {
        feedback({type: 'avast-sas-avastpay'});
      });

      $('.avast-sas-rate-button-yes').mouseup(function(e) {
        e.preventDefault();
        $('.avast-sas-ripple').remove();
        $('.avast-sas-help').removeClass('avast-sas-drop-show');
        showBlockExcl('#avast-sas-rate-modal-glad');
      });

      $('.avast-sas-rate-button-no').mouseup(function(e) {
        e.preventDefault();
        $('.avast-sas-ripple').remove();
        $('.avast-sas-help').removeClass('avast-sas-drop-show');
        showBlockExcl('#avast-sas-rate-modal-sorry');
      });

      $('.avast-sas-rate-button').mouseup(function(e) {
        var userRated = false;
        if(e.currentTarget.id.indexOf("rate-button-power") != -1) {
          // update rated only for power users 
          userRated = true;
        }
        e.preventDefault();
        $('.avast-sas-rate-modal').removeClass('avast-sas-drop-show');
        feedback({
          type: 'avast-sas-rate-good',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          userRated: userRated,
          referrer: data.referrer || ""
        });
      });

      $('.avast-sas-rate-button-feedback').mouseup(function(e) {
        e.preventDefault();
        $('.avast-sas-rate-modal').removeClass('avast-sas-drop-show');
        feedback({
          type: 'avast-sas-rate-bad',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          referrer: data.referrer || ""
        });
      });

      $('.avast-sas-rate-button, .avast-sas-rate-button-feedback, .avast-sas-rate-button-yes, .avast-sas-rate-button-no').mousedown(function(e) {
        e.preventDefault();
        AvastWRC.ial.addRippleEffect(e, e.target.className);
      });

      $('.avast-sas-rate-link-text, .avast-sas-rate-close i').click(function(e) {
        var userReject = false;
        if(e.currentTarget.offsetParent.id.indexOf("close-button-power") != -1 || e.currentTarget.id.indexOf("continue-shopping-link-power") != -1) {
          // update reject only for power users 
          userReject = true;
        }
        e.preventDefault();
        $('.avast-sas-rate-modal').removeClass('avast-sas-drop-show');
        feedback({
          type: 'avast-sas-rate-continue-shopping',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          userReject: userReject,
          referrer: data.referrer || ""
        });
      });

      setTimeout(function(){
          $('.avast-sas').removeClass("avast-sas-discreet");
      },100);

      $('.avast-sas-settings-list').click(function(e) {
        hideBlock('#avast-sas-settings-drop');
        var action = e.currentTarget.id;
        feedback ({type: 'safeShopSettings', 
          action: action,
          domain: domain,
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          referrer: data.referrer || ""
        });
        if(action == 'sas-hide-domain' || action == 'sas-hide-all'){ 
         	bar.remove();
        }
        else if(action == 'sas-show-domain'){
        	$('#sas-show-domain').removeClass('individial-setting-show');
          $('#sas-show-domain').addClass('individial-setting-hide');
          $('#sas-hide-domain').removeClass('individial-setting-hide');
          $('#sas-hide-domain').addClass('individial-setting-show');
        }
        else if(action == 'sas-show-all'){
        	$('#sas-show-all').removeClass('individial-setting-show');
        	$('#sas-show-all').addClass('individial-setting-hide');
        	$('#sas-hide-all').removeClass('individial-setting-hide');
 			    $('#sas-hide-all').addClass('individial-setting-show');
        }
      });

      $('.avast-sas-settings-list').hover(function(){
          $('#avast-sas-settings').addClass('settings-hover');
          showBlock('#avast-sas-settings-drop');
        }, function(){
          $('avast-sas-settings').removeClass('settings-hover');
          hideBlock('#avast-sas-settings-drop');
      });

      $('.avast-sas-offer-link').hover(function(){
        $('#avast-sas-offers').addClass('drop-hover');
        $('#avast-sas-accommodations').addClass('drop-hover');
        }, function(){
          $('#avast-sas-offers').removeClass('drop-hover');
          $('#avast-sas-accommodations').removeClass('drop-hover');
      });

      $('.avast-sas-coupon-link').hover(function(){
        $('#avast-sas-coupons').addClass('drop-hover');
        }, function(){
          $('#avast-sas-coupons').removeClass('drop-hover');
      });

      function OfferClick(e){
        e.preventDefault();
        var url = e.currentTarget.href;
        var offers = [];          
        var offer = null;
        var offerCategory = "";
        var bestOffer = false;
        if ((e.currentTarget.firstElementChild.className.indexOf("avast-sas-button") == 0)||
            (e.currentTarget.firstElementChild.className.indexOf("avast-sas-first-offer-button") == 0)||
            (e.currentTarget.firstElementChild.className.indexOf("avast-sas-best-offer-button") == 0)){
          bestOffer = true;
        }          
        if (data.products.length > 0){
          offers = data.products;
          offerCategory = "PRODUCT";
        }else if(data.accommodations.length > 0){
          offers = data.accommodations;
          offerCategory = "ACCOMMODATION";
        }
        for (var i=0; i<offers.length; i++) {
          if (offers[i].url === url) {
            offer = offers[i];
            break;
          }
        }
        if (url) {
          feedback({type: 'offerRedirect',
            url: url,
            offer: offer,
            offerCategory: offerCategory,
            providerId: data.safeShopData.providerId?data.safeShopData.providerId:"",
            query: data.safeShopData.scan?JSON.stringify(data.safeShopData.scan):"",
            offerQuery: data.offerQuery,
            bestOffer: bestOffer,
            campaignId: data.campaignId,
            showABTest: data.showABTest,
            showRateWindow: data.showRateWindow,
            referrer: data.referrer || "",
            which: e.target.myWhich || 1
          });
        }
        e.target.myWhich = 0;
        if(data.showRateWindow) {
          showBlockExcl('#avast-sas-rate-modal-power');
          data.showRateWindow = false;
        }
      }

      $('.avast-sas-offer-link, .avast-sas-offer-link-recommended-offer, .avast-sas-best-offer-link').click(function(e){
        e.preventDefault();
        OfferClick(e);
      });

      $('.avast-sas-offer-link>, .avast-sas-offer-link-recommended-offer>, .avast-sas-best-offer-link>').bind("auxclick",function(e){
        e.preventDefault();
        if(e.which == 2 || e.which == 3){
          e.target.myWhich = e.which;
          e.target.click();
        }
        return false;
      });

      $('#avast-sas-best-offer-link>div').hover(function(e) {
          e.preventDefault();
            alignPosition('#avast-sas-best-button-hover', '#avast-sas-best-offer-link>div', true, 0);

          $('#avast-sas-best-button-hover').addClass('avast-sas-confirm-show');        
        },function(e) {
          e.preventDefault();
          $('#avast-sas-best-button-hover').removeClass('avast-sas-confirm-show');
      });
      
      function CouponClick(e){
        e.preventDefault();
        var url = e.currentTarget.href,
        coupons = data.coupons,
        coupon = null,
        bestOffer = false;

        if ((e.currentTarget.firstElementChild.className.indexOf("avast-sas-button") == 0)||
            (e.currentTarget.firstElementChild.className.indexOf("avast-sas-first-offer-button") == 0)){
          bestOffer = true;
        } 
        for (var i=0; i<coupons.length; i++) {
          if (coupons[i].url === url) {
            coupon = coupons[i];
            break;
          }
        }      
        if (url) {
          feedback({
            type : 'couponRedirect',
            url  : url,
            coupon : coupon,
            campaignId: data.campaignId,
            showABTest: data.showABTest,
            showRateWindow: data.showRateWindow,
            referrer: data.referrer || "",
            which: e.target.myWhich || 1,
            providerId: data.safeShopData.providerId?data.safeShopData.providerId:"",
            query: data.safeShopData.scan?JSON.stringify(data.safeShopData.scan):"",
            offerQuery: data.offerQuery,
            bestOffer: bestOffer
          });
        }
		    e.target.myWhich = 0;
        if(data.showRateWindow) {
          showBlockExcl('#avast-sas-rate-modal-power');
          data.showRateWindow = false;
        }
      }
      /**
       * Handle Coupon links. Block link and pass event back to extension.
       * @param  {event} e click event
       */
      $('.avast-sas-coupon-link, .avast-sas-best-coupon-link').click(function(e){
        e.preventDefault();
        CouponClick(e);
      });

      $('.avast-sas-coupon-link>, .avast-sas-best-coupon-link>').bind("auxclick",function(e){
        e.preventDefault();
        if(e.which == 2 || e.which == 3){
          e.target.myWhich = e.which;
          e.target.click();
        }
        return false;
      });

      $('.avast-sas-logo').click(function(e){
        feedback({
          type: 'avast-sas-logo',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          referrer: data.referrer || ""
        }); 
      });

      $('.avast-sas-code-button').click(function(e) {
        e.preventDefault();
        var text = e.currentTarget.textContent;
        AvastWRC.ial.bs.messageHandler('copyToClipboard', {text: text});
        
        alignPosition('#avast-sas-copied-confirm', '.avast-sas-code-button', true, 0);

        $('#avast-sas-copied-confirm').addClass('avast-sas-confirm-show');
        setTimeout(function() {
          $('#avast-sas-copied-confirm').removeClass('avast-sas-confirm-show');
        }, 2000);
      });

      if (bar.show()){
        feedback({
          type: 'avast-sas-shown',
          campaignId: data.campaignId,
          showABTest: data.showABTest,
          referrer: data.referrer || ""
        }); 
      }
      
      if (data.showOnboardingPage) {
        helpShow();
      }

      // set refresh interval
      if (!safeShopRefreshIID) {
        safeShopRefreshIID = setInterval(
          function () {
            if(data && data.safeShopData){
              AvastWRC.ial.bs.messageHandler('safeShopOffersFound', data.safeShopData);
            }             
          },
          SAFESHOP_REFRESH_INTERVAL
        );
      }

    }//createSafeShopBar

  };

  /* Register SafePrice Event handlers */
  AvastWRC.ial.registerEvents(function(ee) {
    ee.on('message.checkSafeShop',
      AvastWRC.ial.sp.checkSafeShop.bind(AvastWRC.ial.sp));
    ee.on('message.showSafeShopCoupon',
      AvastWRC.ial.sp.createSafeShopBarCoupon.bind(AvastWRC.ial.sp));
    ee.on('message.showSafeShop',
      AvastWRC.ial.sp.createSafeShopBar.bind(AvastWRC.ial.sp));
  });

}).call(this, $);
