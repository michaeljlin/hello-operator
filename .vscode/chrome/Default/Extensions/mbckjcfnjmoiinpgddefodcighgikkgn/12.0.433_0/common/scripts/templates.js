/*******************************************************************************
 *  avast! Online Security plugin - Mustache.js HTML Templates - cross browser
 *  (c) 2014 Avast Corp.
 ******************************************************************************/

var AvastWRC = AvastWRC || {};


AvastWRC.Templates = {
  /**
   * Process templates declaration and append templates to container
   */
  add: function (declaration) {
    function addPart(acc, part) {
      if (part instanceof Array) {
        for (var i = 0; i < part.length; i++) {
          addPart(acc, part[i]);
        }
      } else if (part instanceof Object) {
        // reference within declaration
        if (part.temp) {
          var temp = declaration[part.temp] || AvastWRC.Templates[part.temp];
          addPart(acc, (part.sect !== undefined) ? temp[part.sect] : temp);
        }
      } else {
        acc.push(part);
      }
    }

    for (var temp in declaration) {
      var parts = [];
      addPart(parts, declaration[temp]);
      this[temp] = parts.join('\n');
    }
  }
};

/*------------------------ SafeShop bar UI templates -------------------------*/
AvastWRC.Templates.add(
{ // --- Templates Declaration
  safeShopBar : [[
    '<div translate="no" class="notranslate avast-extension-safeshop-bar avast-sas {{#coupon}}avast-sas-coupon{{/coupon}}">',
      '<div class="avast-sas-the-bar">',
        //<!-- logo -->
        '<div class="avast-sas-logo">',
          '<a style="background-image: url({{images.logo}});"></a>',
        '</div>',
        //picked coupon bar
        '{{#coupon}}',
          '<div class="avast-sas-coupon-value-block">',
              '{{#coupon.label}}',
                '<div class="avast-sas-cupon-label-text" title="{{coupon.label}}">{{coupon.label}}</div>',
              '{{/coupon.label}}',
          '</div>',

          '{{#coupon.code}}',
            '<div class="avast-sas-coupon-code-block" id="coupon-code">',
              '<div class="avast-sas-cupon-code-title-text">{{strings.sasCouponCodeTitle}} ({{strings.sasClickToCopy}}) </div>',
              '<div class="avast-sas-code-button" title="{{coupon.text}}">{{coupon.code}}</div>',
            '</div>',
          '{{/coupon.code}}',

          '{{^coupon.code}}',
            '<div class="avast-sas-coupon-code-block">',
              '<div class="avast-sas-cupon-code-title-text"">{{strings.sasCouponCodeTitle}}</div>',
              '<div class="avast-sas-nocode-button" title="{{coupon.text}}">{{strings.sasNoCouponCode}}</div>',
            '</div>',
          '{{/coupon.code}}',

        '{{/coupon}}',

        //<!-- best product - call2action -->
        '{{#products.length}}',
          '<div class="avast-sas-first-offer-block">',
            '<a class="avast-sas-best-offer-link" href="{{firstProduct.url}}" id="avast-sas-best-offer-link">',
                '<div class="avast-sas-best-offer-button">',
                  '<div class="avast-sas-best-offer-details">',
                    '<div class="avast-sas-best-offer-description" title="{{firstProduct.label}}">{{firstProduct.label}}</div>',
	                  '{{#firstProduct.shipping}}',
                      '<div class="avast-sas-best-offer-shipping" title="{{strings.sasShippingLabel}} {{firstProduct.shipping}}">{{strings.sasShippingLabel}} {{firstProduct.shipping}}</div>',
	                  '{{/firstProduct.shipping}}',
                    '{{#strings.safeShopBestButton}}',
                      '{{#offerQuery.formatted_price}}',
                        '<div class="avast-sas-best-offer-original-price">{{offerQuery.formatted_price}}</div>',
                      '{{/offerQuery.formatted_price}}',
                    '{{/strings.safeShopBestButton}}',
                    '<div class="avast-sas-best-offer-better-price">{{firstProduct.fprice}}</div>',
                  '</div>',
                  '{{#strings.safeShopBestButton}}',
                    '<div class="avast-sas-best-offer-saving-text">{{strings.safeShopBestButton}}</div>',
                  '{{/strings.safeShopBestButton}}',
                  '{{#firstProduct.saving}}',
                    '<i class="avast-sas-best-offer-saving-icon" style="background-image: url({{images.bestOfferArrow}});"></i>',
                  '{{/firstProduct.saving}}',
                  '{{^firstProduct.saving}}',
                    '<i class="avast-sas-best-offer-not-saving-icon" style="background-image: url({{images.bestOfferArrow}});"></i>',
                  '{{/firstProduct.saving}}',
                '</div>',              
            '</a>',
          '</div>',

          //<!-- other products -->
          '<div class="avast-sas-drop-offers-block" id="avast-sas-offers">',
            '<div class="avast-sas-drop-text">{{strings.safeShopOffers}}</div>',
            '<i class="avast-sas-drop-icon" style="background-image: url({{images.drop}});"></i>',
          '</div>',
        '{{/products.length}}',
        
        '{{#couponsTitle}}',
          '<div class="avast-sas-first-offer-block">',
            '<a class="avast-sas-best-coupon-link" href="{{bestCouponUrl}}" id="avast-sas-best-offer-link">',
              '<div class="avast-sas-first-offer-button" title="{{strings.safeShopCouponsTitle}} {{strings.safeShopCouponsSaving}}">{{strings.safeShopCouponsTitle}} {{strings.safeShopCouponsSaving}}</div>',
            '</a>',
          '</div>',
        '{{/couponsTitle}}',
        
        '{{#accommodations.length}}',
          '<div class="avast-sas-first-offer-block">',
            '{{#hotelSearchPage}}',  
              '<div class="avast-sas-first-offer-text">{{strings.safeShopBestTitle}}</div>',
            '{{/hotelSearchPage}}',  
            '<a class="avast-sas-best-offer-link" href="{{firstProduct.url}}" id="avast-sas-best-offer-link">', 
              '{{#hotelSearchPage}}', 
                '<div class="avast-sas-first-offer-button">{{strings.safeShopBestOnSiteButton}}</div>',
              '{{/hotelSearchPage}}',
              '{{^hotelSearchPage}}',
                '<div class="avast-sas-best-offer-button">',
                  '<div class="avast-sas-best-offer-details">',
                    '{{#firstProduct.affiliate_image}}',  
                      '<img class= "avast-sas-best-offer-hotel-image" src="{{firstProduct.affiliate_image}}">',
                    '{{/firstProduct.affiliate_image}}',  
                    '<div class="avast-sas-best-accommodation-description" title="{{firstProduct.label}}">{{firstProduct.label}}</div>',
                    '{{#firstProduct.stars_to_show}}',
                      '<div class="avast-sas-best-offer-stars">',
                        '<div class="star-{{firstProduct.stars_to_show}}" style="background-image: {{firstProduct.starsBackgroundImg}};"></div>',
                      '</div>',
                    '{{/firstProduct.stars_to_show}}',
                    '{{#strings.safeShopBestButton}}',
                      '{{#offerQuery.formatted_price}}',
                        '<div class="avast-sas-best-offer-original-price">{{offerQuery.formatted_price}}</div>',
                      '{{/offerQuery.formatted_price}}',
                      '<div class="avast-sas-best-offer-better-price">{{firstProduct.fprice}}</div>',
                    '{{/strings.safeShopBestButton}}',
                    '{{^strings.safeShopBestButton}}',
                      '{{#strings.safeShopBestOnSiteButton}}',
                        '<div class="avast-sas-best-offer-better-price">{{firstProduct.fprice}}</div>',
                      '{{/strings.safeShopBestOnSiteButton}}',
                    '{{/strings.safeShopBestButton}}',
                  '</div>',
                  '{{#strings.safeShopBestButton}}', 
                    '<div class="avast-sas-best-offer-saving-text">{{strings.safeShopBestButton}}</div>',
                  '{{/strings.safeShopBestButton}}', 
                  '{{#firstProduct.saving}}',
                    '<i class="avast-sas-best-offer-saving-icon" style="background-image: url({{images.bestOfferArrow}});"></i>',
                  '{{/firstProduct.saving}}',
                  '{{^firstProduct.saving}}',
                    '<i class="avast-sas-best-offer-not-saving-icon" style="background-image: url({{images.bestOfferArrow}});"></i>',
                  '{{/firstProduct.saving}}',
                '</div>',
              '{{/hotelSearchPage}}',
            '</a>',
          '</div>',

          //<!-- other products -->
          '<div class="avast-sas-drop-offers-block" id="avast-sas-accommodations">',
            '<div class="avast-sas-drop-text">{{strings.safeShopOffers}}</div>',
            '<i class="avast-sas-drop-icon" style="background-image: url({{images.drop}});"></i>',
          '</div>',
        '{{/accommodations.length}}',


        //<!-- coupons -->
        '{{#coupons.length}}',
          '<div class="avast-sas-drop-offers-block" id="avast-sas-coupons">',
            '<div class="avast-sas-drop-text">{{strings.safeShopCoupons}}</div>',
            '<i class="avast-sas-drop-icon" style="background-image: url({{images.drop}});"></i>',
          '</div>',
        '{{/coupons.length}}',

        // <!-- close -->
        '<div class="avast-sas-close" id="avast-sas-close">',
          '<i style="background-image: url({{images.close}});"></i>',
        '</div>',

        // <!-- help --> don't show this on coupons bar
        '{{^coupon}}',
          '<div class="avast-sas-help" id="avast-sas-help">',
            '<i style="background-image: url({{images.help}});"></i>',
          '</div>',
        '{{/coupon}}',
        // <!-- settings ??? --> don't show this on coupons bar
        '{{^coupon}}',
          '<div class="avast-sas-settings" id="avast-sas-settings">',
            '<i style="background-image: url({{images.conf}});"></i>',
          '</div>',
        '{{/coupon}}',
      '</div>'
    ],
    '<div class="avast-sas-confirm" id="avast-sas-copied-confirm">{{strings.sasCouponCodeCopied}}</div>',
    '{{#firstProduct.additional_fees}}',
      '{{^hotelSearchPage}}',
        '<div class="avast-sas-confirm" id="avast-sas-best-button-hover">{{strings.sasAdditionalFees}}</div>',
      '{{/hotelSearchPage}}',
    '{{/firstProduct.additional_fees}}',
    {temp: 'safeShopOffers'},
    {temp: 'safeShopAccommodations'},
    {temp: 'safeShopCoupons'},
    {temp: 'safeShopHelp'},
    {temp: 'safeShopSettings'},
    {temp: 'safeShopRate'},
    {temp: 'safeShopRateGlad'},
    {temp: 'safeShopRateSorry'},
    [
    '</div>'
  ]],

   // SafeShop Products dropdown
  safeShopOffers : [
    //<!-- other products - dropdown -->
    '<div class="avast-sas-drop" id="avast-sas-offers-drop"  {{^firstProduct.saving}} style="width: 461px;" {{/firstProduct.saving}}>',
      //<!-- list item -->
      '{{#products}}',
        '<a href="{{url}}" class="avast-sas-drop-list avast-sas-offer-link" target="_blank" {{^firstProduct.saving}} style="width: 461px;" {{/firstProduct.saving}}>',
          '{{#firstProduct.saving}}',
            '<div class="avast-sas-item-badge" title="{{saving}}">{{saving}}</div>',
          '{{/firstProduct.saving}}',
          '<div class="avast-sas-container-price-shipping">',
            '<div class="avast-sas-item-price" title="{{fprice}}">{{fprice}}</div>',
            '{{#shipping}}',
              '<div class="avast-sas-item-shipping" title="{{strings.sasShippingLabel}} {{shipping}}">{{strings.sasShippingLabel}} {{shipping}}</div>',
            '{{/shipping}}',
          '</div>',
          '<div class="avast-sas-container-description-availability">',
            '<div class="avast-sas-item-description" title="{{label}}">{{label}}</div>',
            '{{#availability_code}}',
              '{{#availability}}',
                '<div class="avast-sas-item-availavility-{{availability_code}}" title="{{availability}}">{{availability}}</div>',
              '{{/availability}}',
            '{{/availability_code}}',
          '</div>',
          '<div class="avast-sas-item-afiliate-image">',
            '{{#affiliate_image}}',
                '<img class="avast-sas-item-afiliate-image-content" src="{{affiliate_image}}">',
            '{{/affiliate_image}}',	
          '</div>',          	     
       '</a>',       
      '{{/products}}',
    '</div>'
  ],

   // SafeShop coupons dropdown
  safeShopCoupons : [
    //<!-- coupons - dropdown -->
    '<div class="avast-sas-drop" id="avast-sas-coupons-drop">',
      //<!-- list item -->
      '{{#coupons}}',
      '<a href="{{url}}" class="avast-sas-drop-list avast-sas-coupon-link">',
        '{{#value}}',
          '<div class="avast-sas-item-badge" title="{{value}}">{{value}}</div>',
        '{{/value}}',
        '{{^value}}',
          '<div class="avast-sas-item-badge">',
            '<img class="avast-sas-item-badge-image" src="{{images.coupon}}">',
          '</div>',
        '{{/value}}',  
        '<div class = "avast-sas-coupon-description-container">',
          '<div class="avast-sas-coupon-description" {{#coupon_text}}title="{{coupon_text}}"{{/coupon_text}}{{^coupon_text}}title="{{label}}"{{/coupon_text}}>{{label}}</div>',
        '</div>',
      '</a>',
      '{{/coupons}}',
    '</div>'
  ],

  // SafeShop Accommodations dropdown
  safeShopAccommodations : [
    //<!-- other products - dropdown -->
    '{{#dropAll}}',
      '<div class="avast-sas-drop" id="avast-sas-accommodations-drop" {{^firstProduct.saving}} style="width: 461px;" {{/firstProduct.saving}}>',
        //<!-- list item -->
        '{{#accommodations}}',
          '<a href="{{url}}" class="avast-sas-drop-list avast-sas-offer-link" target="_blank" {{^firstProduct.saving}} style="width: 461px;" {{/firstProduct.saving}}>',
            '{{#firstProduct.saving}}',
              '<div class="avast-sas-item-badge" title="{{saving}}">{{saving}}</div>',
            '{{/firstProduct.saving}}',
            '<div class="avast-sas-container-price-fees">',
              '{{#additional_fees}}',
                '<div class="avast-sas-item-price" title="{{fprice}}">{{fprice}}</div>',
                '<div class="avast-sas-item-fees" title="{{strings.sasAdditionalFees}}">{{strings.sasAdditionalFees}}</div>',
              '{{/additional_fees}}',
              '{{^additional_fees}}',
                '<div class="avast-sas-item-fees" title="{{strings.sasStartingPrice}} {{fprice}}">{{strings.sasStartingPrice}}</div>',
                '<div class="avast-sas-item-price" title="{{strings.sasStartingPrice}} {{fprice}}">{{fprice}}</div>',
              '{{/additional_fees}}',
            '</div>',
            '<div class="avast-sas-container-description-stars">',
              '<div class="avast-sas-item-description" title="{{label}}">{{label}}</div>',
              '{{#stars_to_show}}',
                '<div class="avast-sas-item-stars avast-sas-star-{{stars_to_show}}" style="background-image: {{starsBackgroundImg}};"></div>',
              '{{/stars_to_show}}',
            '</div>',	          
            '<div class="avast-sas-item-afiliate-hotel-image">',
              '{{#affiliate_image}}',
                  '<img class="avast-sas-item-afiliate-hotel-image-content" src="{{affiliate_image}}">',
              '{{/affiliate_image}}',
            '</div>',          		     
          '</a>',       
        '{{/accommodations}}',      
      '</div>',
    '{{/dropAll}}',
    '{{^dropAll}}',
      '{{#dropSimilar}}',
        '<div class="avast-sas-drop" id="avast-sas-accommodations-drop" style="width: 347px;">',
          //<!-- list item -->
          '{{#hotelsSimilar}}',
            '<a href="{{url}}" class="avast-sas-drop-list avast-sas-offer-link" target="_blank" style="width: 347px;">',
              '<div class="avast-sas-container-description-stars" style= "padding-left: 10px">',
                '<div class="avast-sas-item-description" title="{{label}}">{{label}}</div>',
                '{{#stars_to_show}}',
                  '<div class="avast-sas-item-stars avast-sas-star-{{stars_to_show}}" style="background-image: {{starsBackgroundImg}};"></div>',
                '{{/stars_to_show}}',
              '</div>',	          
              '<div class="avast-sas-item-afiliate-hotel-image">',
                '{{#affiliate_image}}',
                    '<img class="avast-sas-item-afiliate-hotel-image-content" src="{{affiliate_image}}">',
                '{{/affiliate_image}}',
              '</div>',
            '</a>',
          '{{/hotelsSimilar}}',
        '</div>',
      '{{/dropSimilar}}',
    '{{/dropAll}}',
  ],

  // SafeShop settings drop down
  safeShopSettings : [
    //<!-- settings - dropdown -->
    '<ul class="avast-sas-right-drop" id="avast-sas-settings-drop">',
      //<!-- settings action items -->
      '{{#settings}}',
        '<li class="avast-sas-settings-list {{#display}}individial-setting-{{display}}{{/display}}" id="{{actionId}}">{{label}}</li>',
      '{{/settings}}',
    '</ul>'
  ],

  // SafeShop help overlay
  safeShopHelp : [
    // <!-- help dropdown -->
    // <!-- to show dropdown add class "avast-sas-drop-show" -->
    '<div class="avast-sas-drop avast-sas-help-dropdown" id="avast-sas-help-drop">',
      '<div class="avast-sas-help-seccions">',  
        '<div class="avast-sas-help-hints" >',
          '<div class="avast-sas-hint-message">',
            '<div class="avast-sas-hint-message-title">{{#avastBranding}}{{strings.sasPromoTitle_Avast}}{{/avastBranding}}{{^avastBranding}}{{strings.sasPromoTitle_AVG}}{{/avastBranding}}</div>',
            '<div class="avast-sas-hint-message-description">{{#avastBranding}}{{strings.sasPromoDescription_Avast}}{{/avastBranding}}{{^avastBranding}}{{strings.sasPromoDescription_AVG}}{{/avastBranding}}</div>',
          '</div>',
          // <!-- hint -->
          '{{#products.length}}',
            '<div class="avast-sas-hint" id="avast-sas-hint-best-offer">',
              '<div class="avast-sas-hint-title">{{strings.sasHintBestOffer}}</div>',
              '<div class="avast-sas-hint-description">{{strings.sasHintBestOfferDesc}}</div>',
            '</div>',
          '{{/products.length}}',
          // <!-- hint -->
          '{{#accommodations.length}}',
            '<div class="avast-sas-hint" id="avast-sas-hint-best-offer">',
              '<div class="avast-sas-hint-title">{{strings.sasHintBestOffer}}</div>',
              '<div class="avast-sas-hint-description">{{strings.sasHintBestOfferDesc}}</div>',
            '</div>',
          '{{/accommodations.length}}',
          // <!-- hint -->
          '{{#products.length}}',
            '<div class="avast-sas-hint" id="avast-sas-hint-compare-prices">',
              '<div class="avast-sas-hint-title">{{strings.sasHintOtherOffers}}</div>',
              '<div class="avast-sas-hint-description">{{strings.sasHintOtherOffersDesc}}</div>',
            '</div>',
          '{{/products.length}}',
          '{{#accommodations.length}}',
            '<div class="avast-sas-hint" id="avast-sas-hint-compare-prices">',
              '<div class="avast-sas-hint-title">{{strings.sasHintOtherOffers}}</div>',
              '<div class="avast-sas-hint-description">{{strings.sasHintOtherOffersDesc}}</div>',
            '</div>',
          '{{/accommodations.length}}',
          // <!-- hint -->
          '{{#coupons.length}}',
            '<div class="avast-sas-hint" id="avast-sas-hint-coupons">',
              '<div class="avast-sas-hint-title">{{strings.sasHintCoupons}}</div>',
              '<div class="avast-sas-hint-description">{{strings.sasHintCouponsDesc}}</div>',
            '</div>',
          '{{/coupons.length}}',

          '<div class="avast-sas-hint-right" id="avast-sas-hint-settings">',
            '<div class="avast-sas-hint-title">{{strings.sasHintSettings}}</div>',
            '<div class="avast-sas-hint-description">{{strings.sasHintSettingsDesc}}</div>',
          '</div>',
        '</div>',
        // <!-- promo part -->
        
        '{{^showOnboardingPage}}', 
          '{{#avastBranding}}',
            '<div class="avast-sas-rate">',
            '<div class="avast-sas-rate-text">{{#avastBranding}}{{strings.safePriceEnjoyQuestion_Avast}}{{/avastBranding}}{{^avastBranding}}{{strings.safePriceEnjoyQuestion_AVG}}{{/avastBranding}}</div>',
              '<div class="avast-sas-rate-buttons">',
                '<div class="avast-sas-rate-button-yes">{{strings.sasAnswerYes}}</div>',
                '<div class="avast-sas-rate-button-no">{{strings.sasAnswerNo}}</div>',
              '</div>',
            '</div>',
          '{{/avastBranding}}',
        '{{/showOnboardingPage}}',
        '<div class="avast-sas-hide">{{strings.sasHide}}</div>',
      '</div>',
    '</div>',
  ],

  //SafeShop Rate overly
  safeShopRate : [
    '{{#avastBranding}}',
      '<div class="avast-sas-rate-modal" id="avast-sas-rate-modal-power">',
        '<div class="avast-sas-rate-screen">',
          '<div class="avast-sas-rate-close" id="close-button-power">',
            '<i style="background-image: url({{images.rateClose}});"></i>',
          '</div>',
          '<div class="avast-sas-rate-logo">',
            '<i style="background-image: url({{images.rateLogo}});"></i>',
          '</div>',
        '<div class="avast-sas-rate-title-text">{{#avastBranding}}{{strings.safePriceEnjoyQuestion_Avast}}{{/avastBranding}}{{^avastBranding}}{{strings.safePriceEnjoyQuestion_AVG}}{{/avastBranding}}</div>',
          '<div class="avast-sas-rate-text">{{strings.safePriceLeaveRating}}</div>',
          '<div class="avast-sas-rate-button" id="rate-button-power">{{strings.sasRate}}</div>',
          '<div class="avast-sas-rate-link-text" id="continue-shopping-link-power">{{strings.safePriceContinueShopping}}</div>',
        '</div>',
      '</div>',
    '{{/avastBranding}}',
  ],

  safeShopRateGlad : [
    '{{#avastBranding}}',
      '<div class="avast-sas-rate-modal" id="avast-sas-rate-modal-glad">',
        '<div class="avast-sas-rate-screen">',
          '<div class="avast-sas-rate-close" id="close-button-glad">',
            '<i style="background-image: url({{images.rateClose}});"></i>',
          '</div>',
          '<div class="avast-sas-rate-logo">',
            '<i style="background-image: url({{images.rateLogoGlad}});"></i>',
          '</div>',
          '<div class="avast-sas-rate-title-text">{{strings.sasGladYouLike}}</div>',
          '<div class="avast-sas-rate-text">{{strings.safePriceLeaveRating}}</div>',
          '<div class="avast-sas-rate-button" id="rate-button-glad">{{strings.sasRate}}</div>',
          '<div class="avast-sas-rate-link-text" id="continue-shopping-link-glad">{{strings.safePriceContinueShopping}}</div>',
        '</div>',
      '</div>',
    '{{/avastBranding}}',
  ],

  safeShopRateSorry : [
    '{{#avastBranding}}',
      '<div class="avast-sas-rate-modal" id="avast-sas-rate-modal-sorry">',
        '<div class="avast-sas-rate-screen">',
          '<div class="avast-sas-rate-close" id="close-button-sorry">',
            '<i style="background-image: url({{images.rateClose}});"></i>',
          '</div>',
          '<div class="avast-sas-rate-logo">',
            '<i style="background-image: url({{images.rateLogoSad}});"></i>',
          '</div>',
          '<div class="avast-sas-rate-title-text">{{strings.sasSorry}}</div>',
          '<div class="avast-sas-rate-text">{{strings.sasWhatToDo}}</div>',
          '<div class="avast-sas-rate-button-feedback" id="feedback-button-sorry">{{strings.sasfeedback}}</div>',
          '<div class="avast-sas-rate-link-text" id="continue-shopping-link-sorry">{{strings.safePriceContinueShopping}}</div>',
        '</div>',
      '</div>',
    '{{/avastBranding}}',
  ],
  defaultPopup: [
      '<span class="avast-sas-default-popup-container-title">{{#sasSPTooltipTitle}}{{{sasSPTooltipTitle}}}{{/sasSPTooltipTitle}}{{^sasSPTooltipTitle}}{{{avgSafePriceTitle}}}{{/sasSPTooltipTitle}}</span>',
      '<span class="avast-sas-default-popup-container-text">{{{sasSPTooltipText}}}</span>',
  ]

   // --ende templates declarations --
});
