/*******************************************************************************
 *
 *  avast! Online Security plugin
 *  (c) 2013 Avast Corp.
 *
 *  @author: Lucian Corlaciu
 *
 *  Background Core - cross browser
 *
 ******************************************************************************/

(function(_, EventEmitter) {

    // Extension editions
    var DEFAULT_EDITION = 0; // if no ed. determined start with AOS ed.

    var EDITION_FEATURES = [
    // 0 - AOS
        {
            applicationEvents : true, // ev. for gamification
            newUrlInfoVersion : true,
            safePrice : true,
        },
    // 1 - ABOS
        {
            applicationEvents : false, // ev. for gamification
            newUrlInfoVersion : true,
            safePrice : false,
        },
    ];

    var CORE_DEFAULT_SETTINGS = { // core defaults
        current : {
            callerId : 0,  // Not set by default
            userId : null,  // Persisted userId
        },
        features : {},
    };

    if (typeof AvastWRC == "undefined") { AvastWRC = {}; } //AVAST Online Security - namespace

    var localStorage = null; // Browser specific local storage
    var sing; // AvastWRC.bal instance - browser agnostic
    var back; // background script instance - browser specific

    var _forcedEdition = null;

    // Web Reputation
    var RATING_LEVEL = ["Undefined", "Positive", "Average", "Bad",];
    var RATING_COLOR = ["#767683","#0CB754","#F1C80B","#F5203E",];

    // Regexp matching URLs that will be enabled with avast:// protocol actions
    var AOS_URLS_ENABLED_URLS = /^http[s]?\:\/\/aos.avast.com(\:\d+)?\/upgrade(\/)?/;

    // Actions assigned to avast protocol: avast://[action]
    //  - action is in form of message to be send to the background script: bal.js
    var AOS_URLS_ACTIONS = {
        "settings" : { message: "openSettings", data : {}, }, // avast://settings -> open settings page
    };

    var SHOW_WELCOME_PAGE_RULE = function (prevMinor, currMinor) {
        // Stop showing the welcome/update screens until provided with better content
        return false;
    };

    AvastWRC.PHISHING_REDIRECT = AvastWRC.SAFE_ZONE_REDIRECT = "https://www.avast.com";
    AvastWRC.SITE_CORRECT_MSG_REDIRECT = "https://www.avast.com/sitecorrect.html";
    AvastWRC.AVAST_UPGRADE_PAGE_URL = "http://aos.avast.com/upgrade/";

    AvastWRC.CREATE_MESSAGE_BOX_TIMEOUT = 1500;

    /*
    * Definition of libraries to inject into content pages - default libs
    *  - modify using 'modifyInjectLibs'
    */
    var _injectLibs = {
        css: [
            "common/ui/css/extension.css",
        ],
        libs: [
            "common/libs/jquery-3.1.1.js",
            "common/libs/mustache.js",
            "common/libs/eventemitter2.js",
            "common/scripts/templates.js",
            "common/scripts/ial.js",
        ],
        script: "scripts/extension.js",
    };

    AvastWRC.bal = {

        EXT_AOS_ID : 0,
        EXT_ABOS_ID : 1,

        RATING_COLOR : RATING_COLOR,
	
        safePrice: false,
    
        brandingType: 0, 

        reqServices: 0x0000, // services  of UrlInfo

        _bal_modules : [], // initialized modules
        _core_modules : [], // core modules
        _bootstrap_modules : [], // bootstrap modules based on edition config
        /**
         * Register BAL module.
         * @param {Object} module to register
         */
        registerModule: function(module) {
            if (typeof module.bootstrap === "function") {
                this._bootstrap_modules.push(module);
            } else {
                this._core_modules.push(module);
            }
        },
        /**
         * EventEmitter instance to hangle background layer events.
         * @type {Object}
         */
        _ee: new EventEmitter({wildcard:true, delimiter: ".",}),
        /**
         * Register events with instance of EventEmitter.
         * @param  {Object} callback to register with instance of eventEmitter
         * @return {void}
         */
        registerEvents: function(registerCallback, thisArg) {
            if (typeof registerCallback === "function") {
                registerCallback.call(thisArg, this._ee);
            }
        },
        // TODO mean to unregister the events
        /**
         * Emit background event
         * @param {String} event name
         * @param {Object} [arg1], [arg2], [...] event arguments
         */
        emitEvent: function() {
        // delegate to event emitter
            this._ee.emit.apply(this._ee, arguments);
        },
        /**
         * browser type
         * @type {String}
         */
        browser: "",

        /**
         * Get important info about the extension running.
         */
        trace: function (log) {
            _.each(this._bal_modules, function(module) {
                if (typeof module.trace === "function") {
                    module.trace(log);
                }
            });

            console.log("> all listeners ", this._ee.listeners("*").length);
        },

        getDateAsString: function(){
            var d = new Date();
            return d.getFullYear()+ "/" + d.getMonth()+ "/"+d.getDate()+ " " + d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        },

        /**
         * Initialization       
         * @param  {Object} _back
         * @return {Object}
         */
        init: function(_back, locStorage, editionConfig, forceEdition) {
            if(sing){
                return sing;
            }

            _forcedEdition = forceEdition;

            EDITION_FEATURES = _.isArray(editionConfig) ?
                _.merge(EDITION_FEATURES, editionConfig) :
                _.map(EDITION_FEATURES, function (features) { return _.merge(features, editionConfig); });
                // same config for all editions applied to all features

            this.back = _back;
            localStorage = locStorage;
            sing = this;

            this.initEdition( _forcedEdition == null ? DEFAULT_EDITION : _forcedEdition );
            
            var defSettings = AvastWRC.bal.getDefaultSettings(this._core_modules);
            sing.settings = new AvastWRC.bal.troughStorage("settings", defSettings);
            /*this.settings = new AvastWRC.bal.troughStorage("settings");

			this.mergeInSettings(CORE_DEFAULT_SETTINGS);*/

            AvastWRC.getStorageAsync("InstallDate")
            .then(function(date){ 
                AvastWRC.CONFIG.InstallDate = date;
            })
            .catch(function(reason){ 
                AvastWRC.CONFIG.InstallDate = sing.getDateAsString();              
                AvastWRC.setStorage("InstallDate", AvastWRC.CONFIG.InstallDate);
            });

            AvastWRC.getStorage("AvastConfig", function(avastConfig){               
                if (typeof avastConfig !== "string") {
                    avastConfig = AvastWRC.getWindowStorage("AvastConfig");                    
                }
                if (typeof avastConfig == "string") {
                    var guids = JSON.parse(avastConfig);
                    if (guids) {
                        AvastWRC.CONFIG.GUID = guids.guid;
                        AvastWRC.CONFIG.AUID = guids.auid;
                        AvastWRC.CONFIG.UUID = guids.uuid;
                        AvastWRC.CONFIG.HWID = guids.hwid;

                        if(guids.plg_guid) {                    
                            AvastWRC.CONFIG.PLG_GUID = guids.plg_guid;
                        }
                        else {
                            if(guids.guid != null && guids.hwid != null) {
                                AvastWRC.CONFIG.PLG_GUID = AvastWRC.bal.utils.getRandomUID();
                            }
                            else if(guids.guid != null && guids.hwid == null) {
                                AvastWRC.CONFIG.PLG_GUID = guids.guid;
                                AvastWRC.CONFIG.GUID = null;
                            }                        
                        }
                        var new_guids = {
                            "guid": AvastWRC.CONFIG.GUID,
                            "plg_guid": AvastWRC.CONFIG.PLG_GUID,
                            "auid": AvastWRC.CONFIG.AUID,
                            "hwid": AvastWRC.CONFIG.HWID,
                            "uuid": AvastWRC.CONFIG.UUID,
                        };
                        AvastWRC.setStorage("AvastConfig", JSON.stringify(new_guids));
                    }
                }else{                
                    AvastWRC.CONFIG.PLG_GUID = AvastWRC.bal.utils.getRandomUID();                
                    var guids = {
                        "guid": AvastWRC.CONFIG.GUID,
                        "plg_guid": AvastWRC.CONFIG.PLG_GUID,
                        "auid": AvastWRC.CONFIG.AUID,
                        "hwid": AvastWRC.CONFIG.HWID,
                        "uuid": AvastWRC.CONFIG.UUID,
                    };
                    AvastWRC.setStorage("AvastConfig", JSON.stringify(guids));                    
                }
            });

            Q.fcall(function() {
                return this._core_modules;
            }.bind(this))
            .then(this.initModules.bind(this))
            .then(this.initModuleSettings.bind(this))             
            .then(function() {
                // Connect Avast if it listens on the machine
                return AvastWRC.local.connect(this);
            }.bind(this))
            .get("avastEdition")
            .then(this.getCurrentEdition.bind(this))
            .then(this.initEdition.bind(this))
            .then(this.bootstrapInit.bind(this))
            .then(this.initModuleSettings.bind(this))
            .then(this.initModules.bind(this))
            .then(this.afterInit.bind(this))
            .fail(function (e) {
                console.error("Error in bal.init: ", e);
            });

      
            if (_.isArray(editionConfig)) {
    	        this.safePrice = editionConfig[0].safePrice;
    	        this.brandingType = editionConfig[0].brandingType;
            }
            else {
    	        this.safePrice = editionConfig.safePrice;
    	        this.brandingType = editionConfig.brandingType;
            }
        
            /* AOSP-639, AOSP-694*/
            if (this.safePrice) {
                if(AvastWRC.getWindowStorage("landingPageShown")) {
                    AvastWRC.setStorage("landingPageShown", true);
                }
                !AvastWRC.getStorage("landingPageShown", function(result) {                    
                    if(result == null || result == false) {
                        AvastWRC.bal.openLandingPageTab(sing.brandingType);
                    }
                });                
            } 

            if(AvastWRC.CONFIG.EXT_TYPE == AvastWRC.EXT_TYPE_SP_AP){
                AvastWRC.getStorage("AvastPayConfig", function(AvastPayConfig) {
                    //default value lang of the browser, it will be updated on processSafeShopOffers function with the value received from backend
                    var isGermany = (ABEK.locale.getBrowserLang().toLowerCase() == "de")?1:0;  
                    if(AvastPayConfig == null || AvastPayConfig == undefined){
                        var avastPay = {
                            checkboxChecked: (AvastWRC.CONFIG.EXT_TYPE == AvastWRC.EXT_TYPE_SP_AP)? 1 : 0,
                            germany: (ABEK.locale.getBrowserLang().toLowerCase() == "de")?1:0,
                            allowedDomains: {"goertz.de": 1,
                                            "sportScheck.com": 1,
                                            "myToys.de": 1} // {"domain":true}
                        };
                        AvastPayConfig = avastPay;
                        AvastWRC.setStorage("AvastPayConfig", AvastPayConfig);
                    }
                    else if (AvastPayConfig.germany != isGermany){
                        //the user changed the lang from the browser so we need to update it on localstorage
                        // (this need to be changed to geoIp)
                        AvastPayConfig.germany = isGermany;
                        AvastWRC.setStorage("AvastPayConfig", AvastPayConfig);
                    }                        

                }); 
            }
            return this;
        },
        initEdition : function (edition) {
            var features = EDITION_FEATURES[edition];

            AvastWRC.CONFIG.EDITION  = edition;
            AvastWRC.CONFIG.FEATURES = features;
            this.reqUrlInfoServices  = features.reqUrlInfoServices;
            AvastWRC.CONFIG.CALLERID = features.callerId;
            AvastWRC.CONFIG.EXT_TYPE = features.extType;
            AvastWRC.CONFIG.EXT_VER  = features.extVer;
            AvastWRC.CONFIG.DATA_VER = features.dataVer;
            AvastWRC.CONFIG.SHOW_NEW_VERSION = features.showNewVersion || false;
      
            return Q.fcall(function() { return edition;});
        },
        bootstrapInit : function (edition) {
            var features = EDITION_FEATURES[edition];
            var bootstrapped = _.reduce(this._bootstrap_modules, function(bModules, moduleBootstrap) {
                var module = moduleBootstrap.bootstrap(features);
                if (module) bModules.push(module);
                return bModules;
            }, [], this);
            return Q.fcall(function () { return bootstrapped; });
        },
        initModules : function (modules) {
            _.each(modules, function(module) {
                if (module) {
          // register individual modules - init and register with event emitter
                    if (typeof module.init === "function") module.init(this);
                    if (typeof module.registerModuleListeners === "function") module.registerModuleListeners(this._ee);
                    this._bal_modules.push(module);
                }
            }, this);
            return Q.fcall(function () { return modules; });
        },
        initModuleSettings : function (modules) {
            new Promise((resolve, reject) => {
                AvastWRC.getStorageAsync("settings")
               .then(function(value){
                    if(value.current.callerId < AvastWRC.CONFIG.CALLERID){
                        value.current.callerId = AvastWRC.CONFIG.CALLERID;
                    }
                    sing.settings.set(value);
                    var defSettings = AvastWRC.bal.getDefaultSettings(modules);
                    AvastWRC.bal.mergeInSettings(defSettings);
                    AvastWRC.bal.updateOldSettings();
                    return Q.fcall(function () { return modules; });
               })
               .catch(function(reason){ 
                    var storageSettings = localStorage.getItem("settings");
                    if(!storageSettings){
                        var defSettings = AvastWRC.bal.getDefaultSettings(modules);
                        if(defSettings && defSettings.current &&  defSettings.current.callerId && defSettings.current.callerId < AvastWRC.CONFIG.CALLERID){
                            defSettings.current.callerId = AvastWRC.CONFIG.CALLERID;
                        }
                        AvastWRC.bal.mergeInSettings(defSettings);                  
                    }
                    else{
                        var userSettings = JSON.parse(storageSettings);
                        if(userSettings.current.callerId < AvastWRC.CONFIG.CALLERID){
                            userSettings.current.callerId = AvastWRC.CONFIG.CALLERID;
                        }
                        sing.settings.set(userSettings);
                        delete localStorage["settings"];
                    }                    
                    AvastWRC.bal.updateOldSettings();
                    return Q.fcall(function () { return modules; });
               });
           });                   
        },
        afterInit : function () {
            _.each(this._bal_modules, function(module) {
                // after init - all modules initialized
                if (typeof module.afterInit === "function") module.afterInit();
                this._bal_modules.push(module);
            }, this);
        },
        
        /**
         * Called once the local based service get initialized.
         */
        initLocalService: function(port) {
            _.each(this._bal_modules, function(module) {
        // after init - all modules initialized
                if (typeof module.initLocalService === "function") module.initLocalService(port);
            }, this);
        },
        /**
         * Modify the inject libraries of the instance.
         * @param {Function} callback function to modify the libraries to inject.
         */
        modifyInjectLibs: function(modifyCallback) {
            if (typeof modifyCallback === "function") {
                _injectLibs = modifyCallback(_injectLibs);
            }
        },
        /**
         * Get extension definition of libraries to inject into content page.
         */
        getInjectLibs: function() {
            return _injectLibs;
        },
        /**
         * creates the settings object or updates an already present one
         * @return {void}
         */
        mergeInSettings: function(settings) {
            var newSettings = this.settings.get(),
                big, small;
            if(!newSettings){
                this.settings.set(settings);
            }else{
                for(big in settings) {
                    if(newSettings[big] === undefined){
                        newSettings[big] = settings[big];
                    }
                    else {
                        for(small in settings[big]) {
                            if (newSettings[big][small] === undefined) {
                                newSettings[big][small] = settings[big][small];
                            }
                        }
                    }
                }
            }            
            this.settings.set(newSettings);
        },
        /**
         * updates the stored settings from AvastWRC
         * @return {void}
         *
         * TODO - save and use settings in a single place
         */
        updateOldSettings: function() {
            var settings = this.settings.get();
            AvastWRC.CONFIG.COMMUNITY_IQ = settings.features.communityIQ;
            AvastWRC.CONFIG.ENABLE_SERP = settings.features.serp;
            AvastWRC.CONFIG.ENABLE_SERP_POPUP = settings.features.serpPopup;
            AvastWRC.CONFIG.ENABLE_SAS = settings.features.safeShop;
            AvastWRC.CONFIG.USERID = settings.current.userId;
        },

        getCurrentEdition : function(localAvastEdition) {
            var deferred = Q.defer();
            if (_forcedEdition == null) {
                var settings = this.settings.get();
                var storedEdition = settings.current.edition;
                if (localAvastEdition !== undefined && localAvastEdition !== null) {
                    if (!storedEdition || storedEdition !== localAvastEdition) {
                        settings.current.edition = localAvastEdition;
                        this.settings.set(settings);
                    }
                    deferred.resolve( localAvastEdition );
                } else {
                    deferred.resolve( storedEdition || DEFAULT_EDITION );
                }
            } else {
                deferred.resolve( _forcedEdition );
            }
            return deferred.promise;
        },

        /**
         * Notify the listeners about feature settings change.
         */
        featureSettingChanged: function(key, oldVal, newVal) {
            this._ee.emit("featureChanged." + key, newVal, oldVal);
            this._ee.emit("feature.changed", key, newVal, oldVal);
        },
        /**
         * Hook in listener to register feature settings and enable/disable the functionality.
         * Linstener is triggered first time upon being registered to get current value.
         * @param {String} key of the feature in sttings
         * @param {Function} listener function called with (newVal, [oldVal]), or (currentVal) on registration
         */
        hookOnFeatureChange: function(key, changeListener) {
            this._ee.on("featureChanged." + key, changeListener);
            // run listener to register current settings

            var settings = this.settings.get();
            changeListener(settings.features[key]);
        },
        /**
         * Default settings with default values
         * @return {Object}
         */
        getDefaultSettings: function(modules) {
            return _.reduce (modules,
                function(defaults, module) {
                    if (typeof module !== "undefined" 
                        && typeof module.getModuleDefaultSettings === "function") {
                        var moduleDefaults = module.getModuleDefaultSettings();
                        if (moduleDefaults) {
                            defaults = _.merge(defaults, moduleDefaults);
                        }
                    }
                    return defaults;
                },
                CORE_DEFAULT_SETTINGS
            );
        },
        getLandingPageCode: function (lang, local) {
            if (lang === "af" && local === "za") return "en-za";
            if (lang === "ar" && local === "sa") return "ar-sa";
            if (lang === "ar" && local === "ae") return "en-ae";
            if (lang === "ar") return "ar-ww";
            if (lang === "be") return "ru-ru";
            if (lang === "ca") return "es-es";
            if (lang === "cs") return "cs-cz";
            if (lang === "cy") return "en-gb";
            if (lang === "da") return "da-dk";
            if (lang === "de") return "de-de";
            if (lang === "el") return "el-gr";
            if (lang === "en" && local === "au") return "en-au";
            if (lang === "en" && local === "ca") return "en-ca";
            if (lang === "en" && local === "gb") return "en-gb";
            if (lang === "en" && local === "ph") return "en-ph";
            if (lang === "en" && local === "us") return "en-us";
            if (lang === "en" && local === "za") return "en-za";
            if (lang === "es" && local === "ar") return "es-ar";
            if (lang === "es" && local === "co") return "es-co";
            if (lang === "es" && local === "es") return "es-es";
            if (lang === "es" && local === "mx") return "es-mx";
            if (lang === "es") return "es-ww";
            if (lang === "eu") return "es-es";
            if (lang === "gu") return "en-in";
            if (lang === "fi") return "fi-fi";
            if (lang === "fo" && local === "fo") return "wn-ww";
            if (lang === "fr" && local === "be") return "fr-be";
            if (lang === "fr" && local === "ca") return "fr-ca";
            if (lang === "fr" && local === "ch") return "fr-ch";
            if (lang === "fr") return "fr-fr";
            if (lang === "gl") return "es-es";
            if (lang === "he") return "he-il";
            if (lang === "hi") return "hi-in";
            if (lang === "hu") return "hu-hu";
            if (lang === "id") return "id-id";
            if (lang === "it") return "it-it";
            if (lang === "ja") return "ja-jp";
            if (lang === "kk") return "ru-kz";
            if (lang === "ko") return "ko-kr";
            if (lang === "nb") return "no-no";
            if (lang === "nl" && local === "be") return "nl-be";
            if (lang === "nl") return "nl-nl";
            if (lang === "nn") return "no-no";
            if (lang === "ns") return "en-za";
            if (lang === "ms") return "en-my";
            if (lang === "pa") return "en-in";
            if (lang === "pl") return "pl-pl";
            if (lang === "pt" && local === "br") return "pt-br";
            if (lang === "pt") return "pt-pt";
            if (lang === "ru") return "ru-ru";
            if (lang === "se" && local === "fi") return "fi-fi";
            if (lang === "se" && local === "no") return "no-no";
            if (lang === "se" && local === "se") return "sv-se";
            if (lang === "sk") return "cs-sk";
            if (lang === "sv") return "sv-se";
            if (lang === "ta") return "en-in";
            if (lang === "te") return "en-in";
            if (lang === "tl") return "tl-ph";
            if (lang === "th") return "th-th";
            if (lang === "tr") return "tr-tr";
            if (lang === "tt") return "ru-ru";
            if (lang === "uk") return "uk-ua";
            if (lang === "vi") return "vi-vn";
            if (lang === "qu") return "es-ww";
            if (lang === "zh" && local === "tw") return "zh-tw";
            if (lang === "zh") return "zh-cn";
            if (lang === "zu" && local === "za") return "en-za";
            return "en-ww";
        },

        openLandingPageTab: function(brandingType) {
            var bLocal = ABEK.locale.getBrowserLocale().toLowerCase();
            var bLang = ABEK.locale.getBrowserLang().toLowerCase();
        
            var codePage = this.getLandingPageCode(bLang, bLocal);
            var p_pro = 43;
        
            if(brandingType == AvastWRC.BRANDING_TYPE_AVG) {
        	p_pro = 72;
            }
        
            console.log("lang:"+bLang+" local:"+bLocal+" code:"+codePage);
            //en-us lang-local

            var installedURL = "https://ipm-provider.ff.avast.com/?action=2&p_pro="+p_pro+"&p_elm=297&p_lid=" + codePage + "&p_lng=" + bLang;
            
            AvastWRC.bs.tabExistsWithUrl("completeInstallation", function(tab){                
                AvastWRC.setStorage("landingPageShown", true);
                if(tab) {                
                    AvastWRC.bs.tabRedirectAndSetActive(tab, installedURL);                
                }
                else {
                    AvastWRC.bs.openInNewTab(installedURL);
                }
            });            
        },

        openAVPageTab: function(brandingType) {
            var url = "http://www.avast.com";
            var valToMatch = "avast.com";
            
            if(brandingType == AvastWRC.BRANDING_TYPE_AVG){
                url = "http://www.avg.com";
                valToMatch = "avg.com";
            }

            
            AvastWRC.bs.tabExistsWithUrl(valToMatch, function(tab){
                if(tab) {                
                    AvastWRC.bs.tabRedirectAndSetActive(tab, url);
                }
                else {
                    AvastWRC.bs.openInNewTab(url);
                }
            });            
        },

        /**
         * Message hub - handles all the messages from the injected scripts
         * @param  {String} type
         * @param  {Object} message
         * @param  {Object} tab
         * @return {void}
         */
        commonMessageHub: function (type, data, tab) {
            if (typeof tab === "undefined") return;

            var url = tab.url || (tab.contentDocument && tab.contentDocument.location
                        ? tab.contentDocument.location.href : null);
            var host = AvastWRC.bal.getHostFromUrl(url);
            switch (type) {
           
            case "openInNewTab":
                AvastWRC.bs.openInNewTab(data.url);
                break;
            case "copyToClipboard":
                AvastWRC.bs.copyToClipboard (data.text);
                break;
            default:
                // emit messages in specific namespace
                this._ee.emit("message." + type, data, tab);
            }
        },

        createSettingsItem: function (feature, value) {
            var interm = false; // (value === -1); // ignoring intermed state
            var active = (interm) ? true : value; // treat intermed as feture is set
            return {
                name        : AvastWRC.bs.getLocalizedString("settings" + feature),
                description : AvastWRC.bs.getLocalizedString("settings" + feature + "Desc"),
                key         : feature,
                active      : active,
                enabled     : true,
                show        : true,
                intermed    : interm,
            };
        },

        /**
         * Detect pages where the extension will handle avast:// protocal URLs.
         * And it applies events to these links to trigger to extension specific functions.
         * Ie. avast://settings opens settings: .../options.html
         * @param {String} page URL
         * @param {Object} relevant tab to process the links
         */
        tabFixAosUrls: function(url, tab) {
            if (AOS_URLS_ENABLED_URLS.test(url)) {
                AvastWRC.bs.accessContent(tab, {
                    message : "fixAosUrls",
                    data: { actions : AOS_URLS_ACTIONS, },
                });
            }
        },
        
        /**
         * Temporary storage
         * @type {Object}
         */
        cache: {
            map: {},
            add: function(itemKey, itemValue, key) {
                (key ? this.map[key] : this.map)[itemKey] = itemValue;
                return itemValue;
            },
            get: function(itemKey, key) {
                return (key ? this.map[key] : this.map)[itemKey];
            },
            contains: function(itemKey, key) {
                return (key ? this.map[key] : this.map).hasOwnProperty(itemKey);
            },
            delete: function(itemKey, key) {
                delete (key ? this.map[key] : this.map)[itemKey];
            },
            reset: function(key) {
                this.map[key] = {};
            },
        },
        /**
         * Persistent storage
         * @type {Object}
         */
        storage: {
            add: function(itemKey, itemValue) {
                localStorage.setItem(itemKey, JSON.stringify(itemValue));
                return itemValue;
            },
            get: function(itemKey, key) {
                var item = localStorage.getItem(itemKey);
                try {
                    return JSON.parse(item);
                } catch (ex) {
                    return {};
                }
            }, 
            contains: function(itemKey, key) {
                return localStorage.hasOwnProperty(itemKey);
            },
            delete: function(itemKey, key) {
                delete localStorage[itemKey];
            },
        },
    /**
     * Persistent Storage wrapper
     * @param  {String} key
     * @param  {Object} initializer - in case the key is not present in localStorage
     * @return {Object} - troughStorage instance with get and set
     */
        troughStorage: function(key, initializer) {
            var tmpVal = null, tmpKey = key;
             
            return {
                get: function() {
                    return tmpVal || (tmpVal = initializer);
                },
                set: function(val) {
                    tmpVal = val;
                    AvastWRC.setStorage(tmpKey, tmpVal);
                },
            };
        },
    /**
     * Helper functions
     */
        isFirefox: function() {
            return sing.browser == "Firefox";
        },
        getBrowserName: function () {
            return sing.browser;
        },
        getHostFromUrl: function(url) {
            if (!url) {
                return undefined;
            }

            var lcUrl = url.toLowerCase();

            if (lcUrl.toLowerCase().indexOf("http") != 0 ||
                lcUrl.toLowerCase().indexOf("chrome") == 0 ||
                lcUrl.toLowerCase().indexOf("data") == 0 ||
                lcUrl.toLowerCase() == "about:newtab" ||
                lcUrl.toLowerCase() == "about:blank")
            {
                return undefined;
            }

            var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/);
            return match.length > 2 ? match[2] : undefined;
        },
        getDomainFromHost: function(host){
            return host ? host.split(".").slice(-2).join(".") : undefined;
        },
        getDomainFromUrl: function(url) {
            return AvastWRC.bal.getDomainFromHost(AvastWRC.bal.getHostFromUrl(url));
        },
        jsonToString: function(obj) {
            var s = "";
            for(var key in obj) {
                if(typeof obj[key] == "object") {
                    s += key+"<br />";
                    s += this.jsonToString(obj[key]);
                } else {
                    s += key+": "+obj[key]+"<br />";
                }
            }

            return s;
        },
        tryParseJSON: function(obj) {
            try {
                return JSON.parse(obj);
            }
            catch(e) {
                return obj;
            }
        },
        tabClosed: function(tabId, host) {
            this.cache.delete("dnt_" + tabId);
        },
        defaultErrorHandler: function(obj) {
        },
        /**
         * WebRep Common Core
         * @type {Object}
         */
        WebRep: {
            /**
             * Creates default resources for building the UI
             * @return {Object}
             */
            getDefaults: function() {
                return {
                    close  : AvastWRC.bs.getLocalImageURL("icn_close.png"),
                    btnLearn : AvastWRC.bs.getLocalizedString("sideDetails").toUpperCase(),
                    btnRate : AvastWRC.bs.getLocalizedString("sideRate").toUpperCase(),
                    btnDash : AvastWRC.bs.getLocalizedString("sideDashboard").toUpperCase(),
                    btnSettings : AvastWRC.bs.getLocalizedString("sideSettings").toUpperCase(),
                    rating : {
                        headline: AvastWRC.bs.getLocalizedString("ratingRate"),
                        footer: AvastWRC.bs.getLocalizedString("ratingNoRate"),
                        close : AvastWRC.bs.getLocalImageURL("icn_close_small.png"),
                        elements: [
                            {
                                text: AvastWRC.bs.getLocalizedString("votePositive").toUpperCase(),
                                image: AvastWRC.bs.getLocalImageURL("icnthumbsmall.png"),                                
                            },
                            {
                                text: AvastWRC.bs.getLocalizedString("voteNegative").toUpperCase(),
                                image: AvastWRC.bs.getLocalImageURL("icnthumbdownsmall.png"),                                
                            },
                        ],
                        negative: {
                            close : AvastWRC.bs.getLocalImageURL("icn_close_small.png"),
                            headline: AvastWRC.bs.getLocalizedString("ratingNegative"),
                            button: AvastWRC.bs.getLocalizedString("ratingDone").toUpperCase(),
                            elements: [
                                {
                                    text: AvastWRC.bs.getLocalizedString("pornography"),
                                    data: "pornography",
                                },
                                {
                                    text: AvastWRC.bs.getLocalizedString("violence"),
                                    data: "violence",
                                },
                                {
                                    text: AvastWRC.bs.getLocalizedString("gambling"),
                                    data: "gambling",
                                },
                                {
                                    text: AvastWRC.bs.getLocalizedString("drugs"),
                                    data: "drugs",
                                },
                                {
                                    text: AvastWRC.bs.getLocalizedString("illegal"),
                                    data: "illegal",
                                },
                                {
                                    text: AvastWRC.bs.getLocalizedString("others"),
                                    data: "others",
                                },
                            ],
                        },
                    },
                    thanks : {
                        close : AvastWRC.bs.getLocalImageURL("icn_close_small.png"),
                        image: AvastWRC.bs.getLocalImageURL("icn_checkbig.png"),
                        headline: AvastWRC.bs.getLocalizedString("thanksHeadline"),
                        message: AvastWRC.bs.getLocalizedString("thanksMessage"),
                    },
                };
            },
            /**
             * Computes  WebRep data for a specific host
             * @param  {String} host
             * @return {Object} - data to be used with mustache.js templates for building the UI
             */
            compute: function(host) {
                var wrc = AvastWRC.Cache.getNoTTL(host), color, ret = AvastWRC.bal.WebRep.getDefaults();
                if(!wrc || !wrc.values){
                    ret.icon  = AvastWRC.bs.getLocalImageURL("icn_norating_big.png");
                    ret.text  = AvastWRC.bs.getLocalizedString("ratingTextUndefined");
                    ret.color = RATING_COLOR[RATING_NONE]; //'#767683';
                    ret.close = AvastWRC.bs.getLocalImageURL("icn_close.png");
                }
                else {
                    var val = wrc.values;
                    switch(wrc.getRatingCategory()) {
                    case AvastWRC.RATING_GOOD:
                        ret.icon = AvastWRC.bs.getLocalImageURL("icn_thumbup_big.png");
                        ret.text = AvastWRC.bs.getLocalizedString("ratingTextPositive");
                        break;
                    case AvastWRC.RATING_AVERAGE:
                        ret.icon = AvastWRC.bs.getLocalImageURL("icn_thumbright_big.png");
                        ret.text = AvastWRC.bs.getLocalizedString("ratingTextAverage");
                        break;
                    case AvastWRC.RATING_BAD:
                        ret.icon = AvastWRC.bs.getLocalImageURL("icn_thumbdown_big.png");
                        ret.text = AvastWRC.bs.getLocalizedString("ratingTextBad");
                        break;
                    }

                    ret.color = RATING_COLOR[wrc.getRatingCategory()];
                    ret.details = {
                        close : AvastWRC.bs.getLocalImageURL("icn_close_small.png"),
                        headline: AvastWRC.bs.getLocalizedString("detailsHeadline"),
                        elements: [
                            {
                                text: AvastWRC.bs.getLocalizedString("detailsMalware" + ( val.block == 1 ? "Yes" : "No" )),
                                image: AvastWRC.bs.getLocalImageURL("icn_bug.png"),
                                color: val.block == 1 ? RATING_COLOR[RATING_BAD] : RATING_COLOR[RATING_GOOD],
                                title: "",
                            },
                            {
                                text: AvastWRC.bs.getLocalizedString("detailsPhishing" + ( val.phishing ? "Yes" : "No" )),
                                image: AvastWRC.bs.getLocalImageURL("icn_eye.png"),
                                color: val.phishing > 1 ? RATING_COLOR[RATING_BAD] : RATING_COLOR[RATING_GOOD], //'#F5203E' : '#0CB754',
                                title: "",
                            },
                            {
                                text: AvastWRC.bs.getLocalizedString("ratingCommunity",[AvastWRC.bs.getLocalizedString("ratingLevel" + RATING_LEVEL[wrc.getRatingCategory()]),]),
                                image: AvastWRC.bs.getLocalImageURL("icn_thumblearn.png"),
                                color: RATING_COLOR[wrc.getRatingCategory()],
                                title: val.rating,
                            },
                        ],
                    };
                }

                return ret;
            },
        },

        /* Wraps bal to register to submodule events */
        Core : {
            registerModuleListeners : function (ee) {
                // register for local Avast service
                ee.on("local.init", function(port) {
                    sing.initLocalService(port);
                });
                ee.on("local.paired", function(guid, auid, hwid, uuid) {
                    if (guid !=="" ) AvastWRC.CONFIG.GUID = guid;
                    if (auid !== "") AvastWRC.CONFIG.AUID = auid;
                    if (guid !== "") AvastWRC.CONFIG.HWID = hwid;
                    if (uuid !== "") AvastWRC.CONFIG.UUID = uuid;
                    var guids = {
                        "guid": AvastWRC.CONFIG.GUID,
                        "plg_guid": AvastWRC.CONFIG.PLG_GUID,
                        "auid": AvastWRC.CONFIG.AUID,
                        "hwid": AvastWRC.CONFIG.HWID,
                        "uuid": AvastWRC.CONFIG.UUID,
                    };
                    AvastWRC.setStorage("AvastConfig", JSON.stringify(guids));
                });
            },
        },

        /**
         * AvastWRC.bal specific utilities.
         */
        utils : {
            /**
             * Retrieve localised strings into given data object
             * based on the string ids array.
             * @param {Object} data to load the strings to
             * @param {Array} identifiers of strings to load
             * @return {Object} updated data object
             */
            loadLocalizedStrings : function (data, stringIds) {
                return _.reduce (stringIds, function(res, stringId) {
                    res[stringId] = AvastWRC.bs.getLocalizedString(stringId);
                    return res;
                }, data);
            },

            /**
             * Create local image url for given key/file map.
             * @param {Object} to add local URLs to
             * @param {Object} map key / image file to create the local URLs for
             * @return {Object} updated data object
             */
            getLocalImageURLs : function (data, imagesMap) {
                return _.reduce (imagesMap, function(res, image, key) {
                    res[key] = AvastWRC.bs.getLocalImageURL(image);
                    return res;
                }, data);
            },

            /**
            * Generate random UID.
            */
            getRandomUID : function () {
                var genericGuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
                var hex = "0123456789abcdef";
                var r = 0;
                var guid = "";
                for (var i = 0; i < genericGuid.length; i++) {
                    if (genericGuid[i] !== "-" && genericGuid[i] !== "4") {
                        r = Math.random() * 16 | 0;
                    }
                    if (genericGuid[i] === "x") {
                        guid += hex[r];
                    } else if (genericGuid[i] === "y") {
                        r &= 0x3;  //  (sample:?0??)
                        r |= 0x8;  // (sample:1???)
                        guid += hex[r];
                    } else {
                        guid += genericGuid[i];
                    }
                }
                return guid;
            },
            /**
            * Generate hash from string.
            */
            getHash(str) {
                var hash = 0;
                if (str.length === 0) return hash;
                for (var i = 0; i < str.length; i++) {
                    var char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return hash;
            },
        }, // utils

        /**
         * Set bal instance with local storage instance.
         * @param {Object} browser local storage instance
         */
        setLocalStorage : function (ls) {
            localStorage = ls;
        },

        /**
         * Check current version and compare with previous version stored.
         * If newer version detected open Avast Welcome page on avast web.
         * @param {Numeric} current extension caller Id
         */
        checkPreviousVersion : function (currentCallerId) {
            var settings = sing.settings.get();
            var previousCallerId = settings.current.callerId;
            if (previousCallerId !== currentCallerId) {
                var prevMinor = previousCallerId % 1000;
                var currMinor = currentCallerId % 1000;

                if ( SHOW_WELCOME_PAGE_RULE(prevMinor, currMinor) ) {
                    AvastWRC.bs.openInNewTab(AvastWRC.AVAST_UPGRADE_PAGE_URL + currentCallerId);
                }
                /* don't ever change what the user did
                // block DNT when updating to 7/8
                if (currMinor === 7 || currMinor === 8 || (currMinor > 8 && prevMinor < 7)) {
                    _alterDntFeaturesDefaults(settings);
                    this.featureSettingChanged("dnt", false, true);
                }*/

                // update saved callerId
                settings.current.callerId = currentCallerId;


                sing.settings.set(settings);
            }
        },

        /**
         * Stores user Id so it is available to subsequent requests and persisted in local storage.
         * @param {String} userid to store
         */
        storeUserId : function (userId) {
            var settings = sing.settings.get();
            settings.current.userId = userId;
            sing.settings.set(settings);
            sing.updateOldSettings(); // refresh settings accessible through AvastWRC
        },

    }; // AvastWRC.bal

    // Init the core module to register for event from sub-modules.
    AvastWRC.bal.registerModule(AvastWRC.bal.Core);

}).call(this, _, EventEmitter2);
/*******************************************************************************
 *  avast! Online Security plugin
 *  (c) 2014 Avast Corp.
 *
 *  Background Layer - SafePrice
 ******************************************************************************/

(function(AvastWRC, _) {

    // Hide time for SafeShop settings - 24hs
    var SAFESHOP_HIDE_TIMEOUT = 24 * 60 * 60 * 1000;

    var SAS_STATUS = {
        NEW: 0,
        OPT_IN: 1,
        OPT_OUT: 2,
    };

    var _safeShopInTab = {};
    var _onBoardingPageInTab = false;
    var _showRateWindowInTab = false;

    /**
     * Parse SafeShop status featur into Avast Offers Proxy status values.
     */
    function parseSafeShopStatusFeature(safeShopVal) {
        return (safeShopVal === -1) ? SAS_STATUS.OPT_IN : //SAS_STATUS.NEW :
            (safeShopVal) ? SAS_STATUS.OPT_IN : SAS_STATUS.OPT_OUT;
    }


    (function(definition) {
        AvastWRC.bal.registerModule({
            bootstrap: function(features) {
                return features.safePrice ? definition() : null;
            },
        });


    })(function() {

        AvastWRC.bal.sp = _.extend(AvastWRC.bal.SP || {}, {

            getProviderInfo: function(data) {
                var showABTest =  data.showABTest;
                var campaignId =  data.campaignId;
                var queryOptions = {
                    url: data.url,
                    tab: data.tab,
                    showABTest: showABTest,
                    campaignId:campaignId,
                    referrer: data.referrer,
                    callback: function(domainInfoResponse) {
                        var timer = 0;
                        var cachedTimer = AvastWRC.TabReqCache.get(data.tab.id, "timer");

                        if (cachedTimer != null) timer = Date.now() - cachedTimer;

                        console.log("getProviderInfo() time " + timer);

                        if (domainInfoResponse && domainInfoResponse.providerId) {
                            _safeShopInTab[data.tab.id] = domainInfoResponse;
                            _safeShopInTab[data.tab.id].showABTest = showABTest;
                            _safeShopInTab[data.tab.id].campaignId = campaignId;
                            if (_safeShopInTab[data.tab.id]) {
                                _safeShopInTab[data.tab.id].count = 0;
                                _safeShopInTab[data.tab.id].url = data.url;
                                if (timer < 50) {
                                    setTimeout(function(tab, url, selector) {
                                        AvastWRC.bal.sp.tabSafeShopCheck(tab.id, tab, url, _safeShopInTab[tab.id]);
                                    }, 50, data.tab, data.url, _safeShopInTab[data.tab.id]);
                                } else {
                                    AvastWRC.bal.sp.tabSafeShopCheck(data.tab.id, data.tab, data.url, _safeShopInTab[data.tab.id]);
                                }
                            }
                        }
                    }
                };
                new AvastWRC.Query.SafeShopDomainInfo(queryOptions); //query Avast SafeShopDomainInfo Proxy
            },

            onUrlInfoResponse: function(url, response, tab, tabUpdate) {
                if (AvastWRC.safeShopCouponActive && tab.id == AvastWRC.safeShopCouponActive.id) {
                    this.tabSafeShopCoupon(tab, AvastWRC.safeShopCouponActive);
                    delete AvastWRC.safeShopCouponActive;
                    console.log("coupon bar");
                    return;
                }
                
                if (!response || !response.values || !response.values.safeShop){
                    console.log("no safeShop value for: " +url);
                    return;
                }
                if(response.values.safeShop.match 
                    || response.values.safeShop.selector || response.values.safeShop.regex || response.values.safeShop.timestamp){
                    
                    var cmp = { showABTest: false,
                        campaignId: "default"};
    
                    if(AvastWRC.Shepherd){
                        cmp = AvastWRC.Shepherd.getCampaing();
                    }

                    var data = {
                        url: url,
                        tab: tab,
                        showABTest: cmp.showABTest,
                        campaignId: cmp.campaignId,
                        referrer: AvastWRC.TabReqCache.get(tab.id,"referer")
                    };
                    AvastWRC.bal.sp.getProviderInfo(data);
                    //this is a shop domain we support
                    var eventDetails = 	{
                        clientInfo: AvastWRC.Utils.getClientInfo(data.campaignId),
                        url: tab.url,
                        eventType: "",
                        offer: null,
                        offerType: ""
                    };		
                    eventDetails.clientInfo.referer = AvastWRC.TabReqCache.get(tab.id,"referer");
                    eventDetails.eventType = "SAFE_SHOP_DOMAIN_VISITED";
                    (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                   
                }
            },

            onPageComplete: function(tabId, tab, url) {

                if (_safeShopInTab[tabId]) {
                    var timer = Date.now() - AvastWRC.TabReqCache.get(tab.id, "timer");
                    console.log("onPageComplete() time " + timer);

                    this.tabSafeShopCheck(tabId, tab, url, _safeShopInTab[tabId]);
                }

                /* Check if request to retrieve domain made and retrive it from tab to make it trackable. */
                var requested = AvastWRC.TabReqCache.get(tabId, "dnt_retrieve_domain");
                if (requested) {
                    var host = AvastWRC.bal.getHostFromUrl(tab.url || tab.contentDocument.location.href);
                    AvastWRC.bal.emitEvent("message.setDomainTrackable", { host: host, });
                    AvastWRC.TabReqCache.set(tabId, "dnt_retrieve_domain", false);
                }
            },

            /**
             * Initiate page data check when safeShop selector received.
             * @param {String} page URL
             * @param {Object} urlInfo response
             * @param {Object} relevant tab to run the check
             */
            tabSafeShopCheck: function(tabId, tab, url, safeShopData) {
                if (!_safeShopInTab[tab.id]) {
                    return;
                }
                _safeShopInTab[tab.id].count++;
                var data = {};

                if (safeShopData && safeShopData.providerId){
                    var onlyCoupons = false;
                    if(!safeShopData.selector){                    
                        safeShopData.category.forEach(function(element) {
                            if(AvastWRC.gpb.All.SafeShopOffer.OfferCategory[element] == "COUPON"){
                            onlyCoupons = true;
                                return;
                            }
                        }, this);
                    }                 

                    var data = {
                        message: "checkSafeShop",
                        data: {
                            url: url,
                            csl: safeShopData.selector ? JSON.parse(safeShopData.selector) : null,
                            tabId: tabId,
                            country: safeShopData.country,
                            providerId: safeShopData.providerId,
                            category: safeShopData.category,
                            ui_adaption_rule: safeShopData.ui_adaption_rule,
                            onlyCoupons: onlyCoupons, // there is no selector, we make the call to ial only to get the referrer
                            showABTest: safeShopData.showABTest,
                            campaignId: safeShopData.campaignId
                        },
                    };

                    var timer = Date.now() - AvastWRC.TabReqCache.get(tab.id, "timer");
                    console.log("tabSafeShopCheck() time " + timer);
                    AvastWRC.bs.accessContent(tab, data);
                }
            },

            safeShopOffersFound: function(data, tab) {
                if (!_safeShopInTab[tab.id]) {
                    return;
                }

                var safeShop = _safeShopInTab[tab.id];

                var repeatScan = 0; //if we parse the site to early we have no data, so parse again

                switch (safeShop.providerId) {
                    case "ciuvo":
                       if (data.scan.name === "RequireError" && safeShop && safeShop.count < 5) {
                           repeatScan = 1;
                       }
                       break;
                    case 'comprigo':
                        if (data.scan.error == true && safeShop && safeShop.count < 5) {
                            repeatScan = 1;
                        }
                        break;
                    /*case 'firstoffer':
                        if (data.scan.err) {
                            repeatScan = 1;
                        }
                        break;*/
                    //TODO add new providers here
                }
                if (repeatScan) {
                    console.log("safeShopOffersFound(): " + data.scan.name + " provider: " + safeShop.providerId);

                    if (!AvastWRC.bal.sp.isSafeShopUrl(tab.url)) {
                        return;
                    }

                    var url = safeShop.url;
                    var count = safeShop.count * 100;
                    setTimeout(function(tab, url, safeShop) {
                        AvastWRC.bal.sp.tabSafeShopCheck(tab.id, tab, url, safeShop);
                    }, count, tab, url, safeShop);
                    return;
                }

                delete _safeShopInTab[tab.id];
                this.processSafeShopOffers(tab, data, function(tab, data) {
                    AvastWRC.bal.emitEvent("control.setIcon", tab.id, "common/ui/icons/logo-safeprice-128.png");                    
                    AvastWRC.bs.accessContent(tab, {
                        message: "showSafeShop",
                        data: data,
                    });
                });
            },
            isSafeShopUrl(url) {
                var domain = AvastWRC.bal.getDomainFromUrl(url);
                if (domain.indexOf("google") != -1 &&
                    url.indexOf("shop") == -1) {
                    return false;
                }
                return true;
            },
            /*
             * There are sites that we need to parse for specifics styles, in order to 
             * show SP bar and not break the site. 
             * This will be improved on new SP multiprovider (the specifics requirment 
             * will come from backend.)
             */
            getPageUiSpecifics(urlDomain) {
                var ui_specifics = [{
                    domainPattern: "^google.*",
                    styles: [{
                        browser: "ALL",
                        specifics: [{
                            styleName: "#viewport",
                            styleProperty: "top",
                            rulesToApply: 1
                        }, ]
                    },
                    {
                        browser: "CHROME",
                        specifics: [{
                            styleName: "#searchform",
                            styleProperty: "top",
                            rulesToApply: 1
                        }, ]
                    },
                    {
                        browser: "OPERA",
                        specifics: [{
                            styleName: "#searchform",
                            styleProperty: "top",
                            rulesToApply: 2
                        }, ]
                    },
                    ]
                },{
					domainPattern: "^booking.*",
					styles: [{
                        browser: "ALL",
                        specifics: [{
                            styleName: "no_bg_img",
                            computedStyle: "before",
                            styleProperty: "top",
                            rulesToApply: 1
                        }, ]
                    },]
				} ];
                var topBarRules = {
                    rulesToApply: 0,
                    specifics: []
                };

                for (var i = 0; i < ui_specifics.length; i++) {
                    if (RegExp(ui_specifics[i].domainPattern).test(urlDomain)) {
                        _.each(ui_specifics[i].styles, function(node) {
                            if (AvastWRC.Utils.getBrowserInfo().getBrowser() === node.browser || node.browser === "ALL") {
                                _.each(node.specifics, function(specific) {
                                    topBarRules.specifics.push({
                                        styleName: specific.styleName,
                                        styleProperty: specific.styleProperty,
                                        computedStyle: specific.computedStyle?specific.computedStyle:null,
                                        dynamicValue: specific.dynamicValue,
                                        dynamicOldValue: specific.dynamicOldValue
                                    });
                                    topBarRules.rulesToApply = specific.rulesToApply;
                                });
                            }
                        });
                    }
                }

                return topBarRules;

            },

            /**
             * Register a request to retrieve domain and enable to track it.
             */
            registerRetriveDomainRequest: function(tabId, tab) {
                AvastWRC.TabReqCache.set(tabId, "dnt_retrieve_domain", true);
            },

            safeShopFeedback: function(data, tab) {
                var settings = AvastWRC.bal.settings.get();
                var eventDetails = 	{
                    clientInfo: AvastWRC.Utils.getClientInfo(data.campaignId),
                    url: tab.url,
                    eventType: "",
                    offer: null,
                    offerCategory: ""
                };			
                eventDetails.clientInfo.referer = data.referrer;		
                switch (data.type) {
                case "safeShopOptin":
                    if(data.showOnboardingPage && !data.helpShow){
                        // onboardingPageShown
                        AvastWRC.Shepherd.onboardingPageShown();
                        _onBoardingPageInTab = false;

                        eventDetails.eventType = "SHOW_ON_BOARDING";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                    }
                    else{
                        settings.features.safeShop = data.optin;
                        AvastWRC.bal.settings.set(settings);
                        eventDetails.eventType = "SHOW_HELP";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                    }                    
                    break;
                case "safeShopSettings":
                    var domain = data.domain;
                    var timeout = (new Date()).getTime() + SAFESHOP_HIDE_TIMEOUT;
                    switch (data.action) {
                    case "sas-block-coupons-domain":
                        settings.safeShop.noCouponDomains[domain] = true;
                        break;
                    case "sas-hide-domain":
                        AvastWRC.SPPopup.unregisterTabWithActiveBar(tab.id);
                        settings.safeShop.hideDomains[domain] = timeout;
                        eventDetails.eventType = "HIDE_ON_THIS_DOMAIN";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                        break;
                    case "sas-hide-all":
                        AvastWRC.SPPopup.cleanTabsWithActiveBarRegistry();
                        settings.safeShop.hideAll = timeout;
                        eventDetails.eventType = "HIDE_ON_ALL_DOMAINS";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                        break;
                    case "sas-show-domain":
                        settings.safeShop.hideDomains[domain] = 0;
                        eventDetails.eventType = "SHOW_ON_THIS_DOMAIN";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                        break;
                    case "sas-show-all":
                        settings.safeShop.hideAll = 0;
                        eventDetails.eventType = "SHOW_ON_ALL_DOMAINS";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                        break;
                    }
                    AvastWRC.bal.settings.set(settings);
                    break;
                case "avast-sas-close":
                    AvastWRC.SPPopup.unregisterTabWithActiveBar(tab.id);
                    if (settings.safeShop.closedByUser[tab.url] != undefined && settings.safeShop.closedByUser[tab.url].closed == 0) {
                        settings.safeShop.closedByUser[tab.url].closed = 1;

                        eventDetails.eventType = "CLOSE_BAR";
                        (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                        var icon = {
                            path: "common/ui/icons/logo-safeprice-128.png",
                            text: settings.safeShop.closedByUser[tab.url].offerNumber.toString(),
                            color: AvastWRC.bal.brandingType == undefined || AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVAST ? "#FF7800" : "#556688" 
                        };
                        AvastWRC.bal.emitEvent("control.setIcon", tab.id, icon.path);
                        AvastWRC.bal.emitEvent("control.showText", tab.id, icon.text, icon.color);
                    }
                    AvastWRC.bal.settings.set(settings);
                    break;
                case "avast-sas-shown":
                    AvastWRC.SPPopup.registerTabWithActiveBar(tab.id);
                    AvastWRC.SPPopup.close();
                    eventDetails.eventType = "BAR_SHOWN";
                    (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                    var icon = {
                        path: "common/ui/icons/logo-safeprice-128.png",
                    };
                    AvastWRC.bal.emitEvent("control.setIcon", tab.id, icon.path);
                    AvastWRC.bal.emitEvent("control.showText", tab.tabId);
                    break;
                case "avast-sas-logo":
                    var brandingType = AvastWRC.bal.brandingType;
                        AvastWRC.bal.openLandingPageTab(brandingType);
                    eventDetails.eventType = "AVAST_WEBSITE";
                    (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
                    break;
                case "avast-sas-avastpay":
                    AvastWRC.getStorage("AvastPayConfig", function(AvastPayConfig) {
                        AvastPayConfig.checkboxChecked = !AvastPayConfig.checkboxChecked;
                        AvastWRC.setStorage("AvastPayConfig", AvastPayConfig);
                    });
                    break;
                case "avast-sas-rate-good":
                    // redirect to the store, save on storage that the user already voted and send burger event
                    if (!AvastWRC.YesNo) break;
                    AvastWRC.bs.openInNewTab(AvastWRC.YesNo.getRatingLink(), function () {
                        if(data.userRated/*power user rated*/) {
                            AvastWRC.YesNo.userHasBeenAsked();
                            _showRateWindowInTab = false;
                        }
                        eventDetails.eventType = "RATE_GOOD";
                        (AvastWRC.Burger != undefined) ? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails) : console.log("no burger lib");
                    });

                    break;
                case "avast-sas-rate-bad":
                    // redirect to the feedback page, and send burger event
                    if(!AvastWRC.Query.CONST.SAFESHOP_FEEDBACK_SERVER)break;
                    AvastWRC.bs.openInNewTab(AvastWRC.Query.CONST.SAFESHOP_FEEDBACK_SERVER, function () {
                        eventDetails.eventType = "RATE_BAD";
                        (AvastWRC.Burger != undefined) ? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails) : console.log("no burger lib");
                    });
                    break;
                case "avast-sas-rate-continue-shopping":
                    if(data.userReject/*power user reject*/) {
                        if (AvastWRC.YesNo) AvastWRC.YesNo.userReject();
                        _showRateWindowInTab = false;
                    }
                    // send burger event                    
                    eventDetails.eventType = "NO_RATE";
                    (AvastWRC.Burger != undefined) ? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails) : console.log("no burger lib");
                    break;
                case "offerRedirect":
                    // open URL in new tab
                    settings.features.usage.clicks = settings.features.usage.clicks + 1;
                    AvastWRC.bal.settings.set(settings);
                    eventDetails.offer = data.offer;
                    eventDetails.offerCategory = data.offerCategory;
                    eventDetails.providerId = data.providerId;
                    eventDetails.query = data.query;
                    eventDetails.offerQuery = data.offerQuery;
                    eventDetails.bestOffer = data.bestOffer;
                    eventDetails.eventType = "OFFER_PICKED";
                    eventDetails.clickType = data.which;
                    (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");

                    if(data.showRateWindow || data.which == 2){
                        AvastWRC.bs.openInNewTabInactive(data.url, function(newTab) {
                            AvastWRC.bal.sp.registerRetriveDomainRequest(AvastWRC.bs.getTabId(newTab), newTab);                           
                        });
                    }else if (data.which != 3){
                        AvastWRC.bs.openInNewTab(data.url, function(newTab) {
                            AvastWRC.bal.sp.registerRetriveDomainRequest(AvastWRC.bs.getTabId(newTab), newTab);
                        });
                    }                   
                    
                    break;
                case "couponRedirect":
                    // 1. Send burger
                    // 2. Open the link in a new tab, wait for the redirects to finish (return to original domain) increase the number of clicks
                    // 3. Insert new Bar with coupon_code and coupon_text
                    eventDetails.offer = data.coupon;
                    eventDetails.offerCategory = "VOUCHER";
                    eventDetails.providerId = data.providerId;
                    eventDetails.query = data.query;
                    eventDetails.offerQuery = data.offerQuery;
                    eventDetails.bestOffer = data.bestOffer;
                    eventDetails.eventType = "OFFER_PICKED";
                    eventDetails.clickType = data.which;
                    (AvastWRC.Burger != undefined)? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");

                    settings.features.usage.clicks = settings.features.usage.clicks + 1;
                    AvastWRC.bal.settings.set(settings);
                    if(data.showRateWindow || data.which == 2){
                        AvastWRC.bs.openInNewTabInactive(data.url);
                    }                        
                    else if(data.which != 3){
                        AvastWRC.bs.openInNewTab(data.url);
                    }

                    AvastWRC.bs.getActiveTab(function(tab) {
                        AvastWRC.safeShopCouponActive = {
                            id: AvastWRC.bs.getTabId(tab),
                            code: data.coupon.coupon_code,
                            text: data.coupon.coupon_text,
                            value: data.coupon.value,
                            label: data.coupon.label,
                            expire: data.coupon.coupon_expire_date,
                            freeshipping: data.coupon.coupon_freeshipping,
                            campaignId: data.campaignId,
                            showABTest: data.showABTest,
                            isCouponBar: true
                        };
                    });

                    break;
                }
            },

            /**
             * Display bar with the coupon instructions
             * @param  {[type]} tab    [description]
             * @param  {[type]} coupon [description]
             * @return {[type]}        [description]
             */
            tabSafeShopCoupon: function(tab, coupon) {
                var urlDomain = AvastWRC.bal.getDomainFromUrl(AvastWRC.bs.getTabUrl(tab));
                var settingsLabelsProps = [urlDomain, ];

                var images = AvastWRC.bal.utils.getLocalImageURLs({}, {
                    logo: "logoAB.png",
                    drop: "dropdown-downAB.png",
                    dropup: "dropdown-upAB.png",
                    help: "helpAB.png",
                    conf: "confAB.png",
                    close: "closeAB.png",
                    arrow: "arrow.png"
                });   

                AvastWRC.bs.accessContent(tab, {
                    message: "showSafeShopCoupon",
                    data: {
                        avastBranding: AvastWRC.bal.brandingType == undefined || AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVAST ? true : false,                       
                        coupon: coupon,
                        showABTest: coupon.showABTest,
                        campaignId: coupon.campaignId,
                        images: images,
                        strings: AvastWRC.bal.utils.loadLocalizedStrings({}, [
                            "sasCouponCodeTitle", "sasClickToCopy", "sasCouponInstructionsTitle", "sasNoCouponCode", "sasCouponCodeCopied",
                        ]),
                        settings: _([
                            ["sas-hide-domain", "sasOptionsDisableOnSite", settingsLabelsProps, ],
                            ["sas-hide-all", "sasOptionsDisableAll", settingsLabelsProps, ],
                        ]).map(function(def) {
                            return {
                                actionId: def[0],
                                label: AvastWRC.bs.getLocalizedString(def[1], def[2]),
                            };
                        }).valueOf(),
                    },
                });
            },

            /**
             * Process safeShop offers returned for given tab.
             * @param {Object} tab to execute the SafeShop for
             * @param {Object} safeShop data retrieved
             * @param {Function} callback function to receive the prcessed data
             */
            processSafeShopOffers: function(tab, data, callback) {
                /*if (AvastWRC.safeShopCouponActive && tab.id == AvastWRC.safeShopCouponActive.id) {
                    this.tabSafeShopCoupon(tab, AvastWRC.safeShopCouponActive);
                    delete AvastWRC.safeShopCouponActive;
                    console.log("coupon bar in processSafeShopOffers");
                    return;
                }*/

                var country = data.country;
                var settings = AvastWRC.bal.settings.get();
                var features = settings.features;
                var urlDomain = AvastWRC.bal.getDomainFromUrl(data.url);
                var timestamp = (new Date()).getTime();
                var domainTimeout = settings.safeShop.hideDomains[urlDomain] || 0;
                var allTimeout = settings.safeShop.hideAll || 0;
                var iconClicked = settings.safeShop.iconClicked || 0;
                var showABTest = data.showABTest;
                var campaignId = data.campaignId;
                var showRateWindow = false;
                var referrer = data.referrer || AvastWRC.TabReqCache.get(tab.id,"referer");
                                 

                //var status = parseSafeShopStatusFeature(features.safeShop);
                //var VoucherSearch = _.any(data.csl.plugins, function(p) {return (p[0] === "VoucherSearch");});
                var queryOptions = {
                    url: data.url,
                    query: data.scan,
                    providerId: data.providerId,
                    category: data.category,
                    state: (domainTimeout > timestamp || allTimeout > timestamp)? 0 : 1,
                    explicit_request: iconClicked,
                    showABTest: showABTest,
                    campaignId: campaignId,
                    //status: status,
                    //VoucherSearch : VoucherSearch,
                    //country: "de", // use country for testing only, otherwise GeoIP devised / 1st lvl domain name, 'us' for 'com'
                    referrer: referrer,
                    callback: function(offersResponse) {
                        if ((!offersResponse.products || offersResponse.products.length === 0) &&
                            (!offersResponse.accommodations || offersResponse.accommodations.length === 0) &&
                            (!offersResponse.vouchers || offersResponse.vouchers.length === 0)
                        ) { return; }

                        if(!_showRateWindowInTab){
                            if(AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVAST){
                                showRateWindow = AvastWRC.YesNo.isPowerUser();
                                _showRateWindowInTab = showRateWindow;
                            }                            
                        }                    
                        var showOnboardingPage = false;
                        if(!_onBoardingPageInTab){
                            showOnboardingPage = AvastWRC.Shepherd.showOnboardingPage();
                            _onBoardingPageInTab = showOnboardingPage;
                        }   

                        var detailsToClosed = {
                            offerNumber: offersResponse.products.length + offersResponse.accommodations.length + offersResponse.vouchers.length,
                            closed: 0
                        };
                        settings.safeShop.closedByUser[data.url] = detailsToClosed;

                        if (iconClicked == 0 && (domainTimeout > timestamp || allTimeout > timestamp)) {
                            var icon = {
                                path: "common/ui/icons/logo-safeprice-128.png",
                                text: detailsToClosed.offerNumber.toString(),
                                color: AvastWRC.bal.brandingType == undefined || AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVAST ? "#FF7800" : "#556688" 
                            };
                            
                            AvastWRC.bal.emitEvent("control.setIcon", tab.id, icon.path);
                            AvastWRC.bal.emitEvent("control.showText", tab.id, icon.text, icon.color);
                            return;
                        }

                        if (iconClicked == 1) {
                            settings.safeShop.iconClicked = 0;
                            AvastWRC.bal.settings.set(settings);
                        }

                        var offerQuery = offersResponse.query;

                        // with the new api we recieve the offers separated by category (products, vouchers, accommodations)
                        var safeShopBestTitle, safeShopBestButton, safeShopBestOnSiteButton,  safeShopOffers, firstProduct;

                        var products = _(offersResponse.products) || [];

                        var hotels = _.groupBy(offersResponse.accommodations, function(item) {return item.type;});
                        var hotelNoType = _(hotels[0]) || null;
                        var hotelsPriceComp = _(hotels[1]) || null;
                        var hotelsCity = _(hotels[2]) || null;
                        var hotelsSimilar = _(hotels[3])|| null;
                        var dropSimilar = false, dropAll = false;
                        var accommodations = _(offersResponse.accommodations) || [];
                        
                        if(products.size() > 0){
                            firstProduct = products.first().valueOf();
                            if (firstProduct.saving) {
                                // best product elsewhere
                                safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleCheaperFound");
                                    safeShopBestButton = AvastWRC.bs.getLocalizedString("safeShopBestOfferSaving", [firstProduct.saving,]).toUpperCase();
                            } else {
                                // best product on the page
                                safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleBestHere");
                                safeShopBestOnSiteButton = AvastWRC.bs.getLocalizedString("safeShopBestButtonNextOffer", [firstProduct.fprice, firstProduct.affiliate, ]);
                            }
                            safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopOffers", [products.size(), firstProduct.fprice, ]);

                        }else if(accommodations.size() > 0){                            
                            if(data.scan.type === "city"){
                                safeShopBestTitle = data.scan.title;
                                firstProduct = accommodations.first().valueOf();
                                safeShopBestOnSiteButton = AvastWRC.bs.getLocalizedString("safeShopPopularHotelIn", [firstProduct.fprice, ]);
                                safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopOffers", [accommodations.size(), firstProduct.fprice, ]);
                                dropAll = true;
                            }
                            else if(hotelsCity.size() > 0 && hotelNoType.size() <= 0 && hotelsPriceComp.size() <= 0 && hotelsSimilar.size() <= 0){
                                safeShopBestTitle = data.scan.title;
                                firstProduct = accommodations.first().valueOf();
                                safeShopBestOnSiteButton = AvastWRC.bs.getLocalizedString("safeShopPopularHotelIn", [firstProduct.fprice, ]);                                
                                safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopOffers", [accommodations.size(), firstProduct.fprice, ]);
                                dropAll = true;
                            }
                            else if(hotelsPriceComp.size() > 0){                                
                                firstProduct = hotelsPriceComp.first().valueOf();
                                if (firstProduct.saving) {
                                    // best product elsewhere
                                    safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleCheaperFound");
                                        safeShopBestButton = AvastWRC.bs.getLocalizedString("safeShopBestOfferSaving", [firstProduct.saving,]).toUpperCase();
                                } else{
                                    // best product on the page
                                    safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleBestHere");
                                    safeShopBestOnSiteButton = AvastWRC.bs.getLocalizedString("safeShopBestButtonNextOffer", [firstProduct.fprice, firstProduct.affiliate, ]);
                                }
                                if (hotelsSimilar.size() > 0){ 
                                    // if price comparison and similar hotels we will show on the button the best offer of price comparison and on the 
                                    // dropdown the similar hotels offers
                                    dropSimilar = true;
                                    safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopSimilarHotel", [hotelsSimilar.size(), ]);
                                }
                                else{
                                    // if price comparison and NOT similar hotels we will show on the button the best offer of price comparison and on the 
                                    // dropdown all the offers
                                    dropAll = true;
                                    safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopOffers", [accommodations.size(), firstProduct.fprice, ]);
                                }
                            }
                            else if(hotelsSimilar.size() > 0){
                                firstProduct = hotelsSimilar.first().valueOf();                          
                                dropSimilar = true;
                                safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopSimilarHotel", [hotelsSimilar.size(),]);
                            }
                            else{
                                firstProduct = accommodations.first().valueOf();
                                safeShopOffers = AvastWRC.bs.getLocalizedString("safeShopOffers", [accommodations.size(), firstProduct.fprice, ]);
                                if (firstProduct.saving) {
                                    // best product elsewhere
                                    safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleCheaperFound");
                                    safeShopBestButton = AvastWRC.bs.getLocalizedString("safeShopBestOfferSaving", [firstProduct.saving,]).toUpperCase();
                                    dropAll = true;
                                } else{
                                    // best product on the page
                                    safeShopBestTitle = AvastWRC.bs.getLocalizedString("safeShopBestTitleBestHere");
                                    safeShopBestOnSiteButton = AvastWRC.bs.getLocalizedString("safeShopBestButtonNextOffer", [firstProduct.fprice, firstProduct.affiliate, ]);
                                    dropAll = true;
                                }
                            }
                        }                      
                        
                        var coupons = _(offersResponse.vouchers) || [];

                        var safeShopCoupons =  AvastWRC.bs.getLocalizedString("safeShopCoupons", [coupons.size(), ]);

                        var bestCoupon = null;
                        var safeShopCouponsTitle = "";
                        var safeShopCouponsSaving = "";

                        if(products.size() <= 0 && accommodations.size() <= 0){
                            bestCoupon = coupons.size() > 0 ? coupons.first().valueOf(): null;
                            safeShopCouponsTitle = AvastWRC.bs.getLocalizedString("sasCouponsTitle", [coupons.size(), ]);
                            safeShopCouponsSaving = (bestCoupon && bestCoupon.value && bestCoupon.value.length > 0) ?
                                AvastWRC.bs.getLocalizedString("sasCouponsSaving", [bestCoupon.value, ]) : "";                           
                        }
                        
                        var settingsLabelsProps = [urlDomain, ];

                        AvastWRC.getStorage("AvastPayConfig", function(AvastPayConfig) {
                            var showAvastPay = 0,
                                avastPaychecekd = 0;
                            if (AvastWRC.CONFIG.EXT_TYPE == AvastWRC.EXT_TYPE_SP_AP && country.toLowerCase().indexOf("de") != -1 ) {                                
                                if (!AvastPayConfig.germany) {
                                    // country recieved from backend (geoIp)
                                    // we need this to update on case of old values
                                    AvastPayConfig.germany = 1;
                                    AvastWRC.setStorage("AvastPayConfig", AvastPayConfig);
                                }

                                showAvastPay = (AvastPayConfig.allowedDomains[AvastWRC.bal.getDomainFromUrl(data.url)]) ? 1 : 0;

                                avastPaychecekd = AvastPayConfig.checkboxChecked;
                            }

                            var images = AvastWRC.bal.utils.getLocalImageURLs({}, {
                                    logo: "logoAB.png",
                                    drop: "dropdown-downAB.png",
                                    dropup: "dropdown-upAB.png",
                                    help: "helpAB.png",
                                    conf: "confAB.png",
                                    close: "closeAB.png",
                                    arrow: "arrow.png",
                                    coupon: "coupon-icon.png",
                                    bestOfferArrow: "best_offer_arrow.png",
                                    rateClose: "rating-icon-close.png",
                                    rateLogo: "rating-safeprice-logo.png",
                                    rateLogoGlad: "rateLogoGlad.png",
                                    rateLogoSad: "rateLogoSad.png"
                                });          
                            
                            var topBarRules = [];
                            if(AvastWRC.Shepherd){
                                topBarRules = AvastWRC.Shepherd.getUIAdaptionRule(urlDomain);
                                if(topBarRules == null){
                                    topBarRules = AvastWRC.bal.sp.getPageUiSpecifics(urlDomain);
                                }
                                   
                            }else{
                                topBarRules = AvastWRC.bal.sp.getPageUiSpecifics(urlDomain);
                            }

                            var showData = {
                                avastBranding: AvastWRC.bal.brandingType == undefined || AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVAST ? true : false,
                                domain: urlDomain,
                                helpShow: false, // will be set to true in ial on the case that the user click on the helpIcon. we need it to differenciate it from onboarding event
                                showOnboardingPage: showOnboardingPage,     
                                showAvastPay: showAvastPay,
                                showABTest: showABTest,
                                campaignId: campaignId,
                                showRateWindow: showRateWindow,
                                referrer: referrer,
                                avastPaychecekd: avastPaychecekd,
                                discreetSlider: false,
                                discreet: true,
                                //isNew: (features.safeShop === -1),
                                offerQuery: offerQuery,
                                products: products.valueOf(),
                                accommodations: accommodations.valueOf(),
                                hotelsSimilar: hotelsSimilar.valueOf(),
                                dropAll: dropAll,
                                dropSimilar: dropSimilar,
                                hotelSearchPage: (data.scan.type === "city"),
                                firstProduct: firstProduct,
                                coupon: [],
                                coupons: coupons.valueOf(),
                                couponsTitle: (coupons.size() > 0 && (products.size() <= 0 && accommodations.size() <= 0)),
                                bestCouponUrl: (bestCoupon ? bestCoupon.url : ""),
                                // hasOffers : dispOffers.length > 0,
                                // hasCoupons : coupons.length > 0,
                                images: images,
                                strings: AvastWRC.bal.utils.loadLocalizedStrings({
                                    safeShopBestTitle: safeShopBestTitle,
                                    safeShopBestButton: safeShopBestButton,
                                    safeShopBestOnSiteButton: safeShopBestOnSiteButton,
                                    safeShopOffers: safeShopOffers,
                                    safeShopCoupons: safeShopCoupons,
                                    safeShopCouponsTitle: safeShopCouponsTitle,
                                    safeShopCouponsSaving: safeShopCouponsSaving,
                                }, [
                                    "sasHintBestOffer", "sasHintBestOfferDesc",
                                    "sasHintOtherOffers", "sasHintOtherOffersDesc",
                                    "sasHintCoupons", "sasHintCouponsDesc",
                                    "sasHintSettings", "sasHintSettingsDesc",
                                    "sasPromoNewBadge", "sasProductName",
                                    "sasPromoDescription_Avast", "sasPromoDescription_AVG", "sasPromoAction",
                                    "sasShippingLabel", "sasCouponCodeTitle",
                                    "sasClickToCopy", "sasCouponInstructionsTitle", "sasRecommendedOfferTitle",
                                    "sasRecommendedOfferMessage","sasAdditionalFees","sasStartingPrice", "safePriceEnjoyQuestion_Avast", "safePriceEnjoyQuestion_AVG",
                                    "safePriceLeaveRating", "sasRate", "safePriceContinueShopping","sasAnswerYes", "sasAnswerNo", 
                                    "sasPromoTitle_Avast", "sasPromoTitle_AVG", "sasHide", "sasGladYouLike", "sasSorry", "sasWhatToDo", "sasfeedback",   
                                ]),
                                // list settings actions
                                settings: _([
                                    //['sas-block-coupons-domain', 'sasOptionsNeverShowOnSite', settingsLabelsProps],
                                    ["sas-hide-domain", "sasOptionsDisableOnSite", settingsLabelsProps, (domainTimeout < timestamp) ? "show" : "hide"],
                                    ["sas-show-domain", "sasOptionsEnableOnSite", settingsLabelsProps, (domainTimeout > timestamp) ? "show" : "hide"],
                                    ["sas-hide-all", "sasOptionsDisableAll", settingsLabelsProps, (allTimeout < timestamp) ? "show" : "hide"],
                                    ["sas-show-all", "sasOptionsEnableAll", settingsLabelsProps, (allTimeout > timestamp) ? "show" : "hide"]
                                ]).map(function(def) {
                                    return {
                                        actionId: def[0],
                                        label: AvastWRC.bs.getLocalizedString(def[1], def[2]),
                                        display: def[3]
                                    };
                                }).valueOf(),
                                safeShopData: data, // needed to refresh the offers without parsing the site again
                                //safeShopOffers: products.valueOf(), //not in use anymore
                                //safeShopCoupons: coupons.valueOf(), //not in use anymore
                                //safeShopAccommodations: accommodations.valueOf(), //not in use anymore
                                showSettings: (Math.floor(AvastWRC.CONFIG.CALLERID / 1000) !== 8),
                                topBarRules: topBarRules,
                                browserType: AvastWRC.Utils.getBrowserInfo().getBrowser()
                            };
                            showData.strings.sasRate = showData.strings.sasRate.toUpperCase();
                            showData.strings.sasHintBestOffer = showData.strings.sasHintBestOffer.toUpperCase();
                            showData.strings.sasHintOtherOffers = showData.strings.sasHintOtherOffers.toUpperCase();
                            showData.strings.sasHintCoupons = showData.strings.sasHintCoupons.toUpperCase();
                            showData.strings.sasHintSettings = showData.strings.sasHintSettings.toUpperCase();
                            showData.strings.sasAnswerYes = showData.strings.sasAnswerYes.toUpperCase();
                            showData.strings.sasAnswerNo = showData.strings.sasAnswerNo.toUpperCase();
                            showData.strings.sasfeedback = showData.strings.sasfeedback.toUpperCase();
                            // replace Avast SafePrice with AVG Safeprice
                            if(showData.strings.sasSPTooltipTitle && AvastWRC.bal.brandingType == AvastWRC.BRANDING_TYPE_AVG ){
                                showData.strings.sasPromoTitle = showData.strings.sasPromoTitle.replace(showData.strings.sasSPTooltipTitle, "AVG SafePrice");
                                showData.strings.sasPromoDescription = showData.strings.sasPromoDescription.replace(showData.strings.sasSPTooltipTitle, "AVG SafePrice");
                            }                            
                            callback(tab, showData);
                        });
                    }
                };

                new AvastWRC.Query.SafeShopOffer(queryOptions); // query Avast Offers Proxy

            }, // processSafeShopOffers

            preparePopupTemplate: function (tabId, tab, url) {
                let translatesStrings = AvastWRC.bal.utils.loadLocalizedStrings({}, AvastWRC.SPPopup.getDefaultPopupStrings());
                AvastWRC.SPPopup.render(translatesStrings);
            },

            /* Register SafePrice Event handlers */
            registerModuleListeners: function(ee) {
                ee.on("urlInfo.response", AvastWRC.bal.sp.onUrlInfoResponse.bind(AvastWRC.bal.sp));
                ee.on("page.complete", AvastWRC.bal.sp.onPageComplete.bind(AvastWRC.bal.sp));
                ee.on("message.safeShopFeedback", AvastWRC.bal.sp.safeShopFeedback.bind(AvastWRC.bal.sp));
                ee.on("message.safeShopOffersFound", AvastWRC.bal.sp.safeShopOffersFound.bind(AvastWRC.bal.sp));
                ee.on("popup.prepareTemplate", AvastWRC.bal.sp.preparePopupTemplate.bind(AvastWRC.bal.sp));
            },

            modifySettingsItem: function(feature, value, item) {
                // Ensure that the setting is shown on options.html page
                if (feature === "safeShop") {
                    item.show = true;
                }
                return item;
            },

            /**
             * Return SafePrice related default settings.
             */
            getModuleDefaultSettings: function() {
                return {
                    safeShop: {
                        noCouponDomains: {}, // {"domain":true}
                        hideDomains: {}, // {"domain":timeout}
                        hideAll: 0, // hide until
                        iconClicked: 0, // to know if the SP icon was clicked
                        closedByUser: []
                            /*{"url":{offerNumber: (number of offers we have), closed: (1 if closed)}} 
								reason: if the user intentionallity closed the bar we show on the badge 
                                the nummer of offers we have for that url (on clic of the icon the bar will appear again)*/
                    },
                    features: {
                        safeShop: -1, // NEW (-1), true = opt-in (default), false = opt-out
                        onBoardingPage: {
                            first: false,
                            second: false,
                            third: false,
                        },
                        usage: {
                            clicks: -1,
                            lastDay: -1
                        }
                    }
                };
            }
        }); // SP
        AvastWRC.Utils.Burger.initBurger(true/*init*/,false/*sendAll*/);
        
        AvastWRC.getStorageAsync("HeartBeat")
        .then(function(date){ 
            var now = parseInt(new Date().getTime())/1000;
            if(date &&  date < now){
                var eventDetails = 	{
                    clientInfo: AvastWRC.Utils.getClientInfo((AvastWRC.Shepherd) ? AvastWRC.Shepherd.getCampaing().campaignId : "default"),
                    url: "",
                    eventType: "HEARTBEAT",
                    offer: null,
                    offerType: ""
                };	
                (AvastWRC.Burger != undefined) ? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
            }
        })
        .catch(function(reason){
            // date will be now + one day
            var date = parseInt(new Date().getTime())/1000 + parseInt(86400);
            AvastWRC.setStorage("HeartBeat", date);
            var eventDetails = 	{
                clientInfo: AvastWRC.Utils.getClientInfo((AvastWRC.Shepherd) ? AvastWRC.Shepherd.getCampaing().campaignId : "default"),
                url: "",
                eventType: "HEARTBEAT",
                offer: null,
                offerType: ""
            };	
            (AvastWRC.Burger != undefined) ? AvastWRC.Burger.emitEvent("burger.newEvent", eventDetails):console.log("no burger lib");
        });
        
        AvastWRC.bal.registerEvents(function(ee) {
            ee.on("urlInfo.response", AvastWRC.bal.sp.onUrlInfoResponse.bind(AvastWRC.bal.sp));
            ee.on("page.complete", AvastWRC.bal.sp.onPageComplete.bind(AvastWRC.bal.sp));
            ee.on("message.safeShopFeedback", AvastWRC.bal.sp.safeShopFeedback.bind(AvastWRC.bal.sp));
            ee.on("message.safeShopOffersFound", AvastWRC.bal.sp.safeShopOffersFound.bind(AvastWRC.bal.sp));
            ee.on("popup.prepareTemplate", AvastWRC.bal.sp.preparePopupTemplate.bind(AvastWRC.bal.sp));
        });
        AvastWRC.bal.registerModule(AvastWRC.bal.sp);

        return AvastWRC.bal.sp;
    });


}).call(this, AvastWRC, _);
/* globals chrome, XMLHttpRequest, self */

class ASDetector {
    
    constructor (blockref) {
    	this.pastEvents = {};
        this.listeners = [];
        this.blockref = blockref || [ new RegExp('\.*&afsrc=1|\\?afsrc=1'),
            new RegExp('.*jdoqocy.com'),
            new RegExp('.*tkqlhce.com'),
            new RegExp('.*dpbolvw.net'),
            new RegExp('.*anrdoezrs.net'),
            new RegExp('.*kqzyfj.com'),
            new RegExp('.*linksynergy\.com'),
            new RegExp('.*linksynergy\.onlineshoes\.com'),
            new RegExp('.*linksynergy\.walmart\.com'),
            new RegExp('.*savings\.com'),
            new RegExp('.*affiliate\.rakuten\.com'),
        ];
        this.ciuvo_rex = [new RegExp('.*ciuvo\.com'), new RegExp('.*localhost:8002')];
        
        this.NEW_EVENT_THRESHOLD_TIME = 800;
        this.TAB_EVENT_EXPIRATION_TIME = 10 * 1000;
        this.SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
        this.TAB_EVENT_EXPIRATION_TIME = this.SESSION_TIMEOUT + 10 * 1000; // 10 seconds
    }
    
    /**
     * Add a new navigation event of the tab's main frame.
     * 
     * @param tabId
     *            the tabId for this navigation event (required)
     * @param url
     *            the url for this navigation event (required)
     * @param requestId
     *            the request-id if available. It helps recognizing multiple
     *            urls which actually belong to one navigation event because
     *            of redirects. (optional)
     * @param timestamp
     *            the timestamp in ms of the navigation event. It is usefull
     *            for recognizing events which belong together (optional).
     * @param main_page_changed
     *            only used in firefox because there a workaround to recognize main-page changes
     *            is needed
     * @returns true if the current chain of navigation events has been
     *          marked as affiliate source. False otherwise.
     */
    onNavigationEvent (tabId, url, requestId, timestamp, main_page_changed) {
        timestamp = timestamp || Date.now();

        var lastEvent = this.getLastEvent(tabId);
        var newEvent = this.isNewEvent(lastEvent, url, requestId, timestamp, main_page_changed);

        // update timestamp & hostname
        lastEvent.timestamp = timestamp;
        lastEvent.hostname = AvastWRC.bal.getHostFromUrl(url);
        lastEvent.isFromCiuvo = this.isCiuvoEvent(url);

        if (lastEvent.isFromCiuvo) {
            // ignore afsrc if ciuvo itself triggered the coupon-click
            lastEvent.isAfsrc = false;
        } else if (!lastEvent.isAfsrc) {
            lastEvent.isAfsrc = this.ifAfsrcEvent(url);
        }

        return lastEvent.isAfsrc;
    }

    /**
     * Whether the event originated with an clickout from ciuvo
     */
    isCiuvoEvent(url) {
        for (var i = 0; i < this.ciuvo_rex.length; ++i) {
            if (this.ciuvo_rex[i].exec(url)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Whether the event originated with an clickout from another affiliate source
     */
    ifAfsrcEvent(url) {
        for (var i = 0; i < this.blockref.length; i++) {
            if (this.blockref[i].exec(url)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @returns dictionary
     */
    getSessionBlockList() {
        var sbl = window.localStorage.getItem("__ciuvo__afsrc__sbl");

        if (sbl && typeof sbl === "string") {
            sbl = JSON.parse(sbl);
        }

        if (!sbl || typeof sbl !== "object") {
            // recover gracefully
            sbl = {};
            this.storeSessionBlockList(sbl);
        }

        return sbl;
    }

    /**
     * @param sbl
     *          dictionary
     */
    storeSessionBlockList(sbl) {
        window.localStorage.setItem("__ciuvo__afsrc__sbl", JSON.stringify(sbl));
    }

    /**
     * @param hostname
     *          the hostname of the request
     */
    addToSessionBlockList(hostname) {
        var blockList = this.getSessionBlockList();
        blockList[hostname] = Date.now();
        this.storeSessionBlockList(blockList);
    }

    /**
     * @param hostname
     *          the hostname of the request
     * @returns true
     *         if it is on the blocklist, resets session timestamp
     **/
    isOnSessionBlockList(hostname) {
        var blockList = this.getSessionBlockList(),
            timestamp = blockList[hostname];

        if (!timestamp) {
            // "The host <" + hostname + "> is not on session block list."
            return false;
        }

        var now_ts = Date.now();

        if (timestamp + this.SESSION_TIMEOUT > now_ts) {
            // "The host <" + hostname + "> is on session block list."
            return true;
        }

        // cleanup expired timestamp
        delete blockList[hostname];
        this.storeSessionBlockList(blockList);
        return false;
    }

    /**
     * decide whether it is a new event or not
     * @param lastEvent
     *            the last Event recorded for this tab
     * @param url
     *            the url for this navigation event (required)
     * @param requestId
     *            the request-id if available. It helps recognizing multiple
     *            urls which actually belong to one navigation event because
     *            of redirects. (optional)
     * @param timestamp
     *            the timestamp in ms of the navigation event. It is usefull
     *            for recognizing events which belong together (optional).
     * @param main_page_changed
     *            only used in firefox because there a workaround to recognize main-page changes
     *            is needed
     * @returns true if this is a new navigation event or part of the same clickout
     **/
    isNewEvent(lastEvent, url, requestId, timestamp, main_page_changed) {

        // try to detect if this is a new navigation event
        if (typeof requestId !== 'undefined') {
            if (requestId == lastEvent.requestId) {
                    return false;
            }
        }

        // those damn JS redirects make requestId unreliable
        var delta = timestamp - lastEvent.timestamp;
        if (delta < this.NEW_EVENT_THRESHOLD_TIME) {
           return false;
        }

        if (lastEvent.isAfsrc)  {
            if (main_page_changed !== undefined)  {
                if (!main_page_changed) {
                        return false;
                }
            } else if ((AvastWRC.bal.getHostFromUrl(url) === lastEvent.hostname) && this.ifAfsrcEvent(url)) {
                // still on the same event
                    return false;
            }
        }

        // create a new event if one has been detected
        lastEvent.isAfsrc = false;
        lastEvent.isFromCiuvo = false;
        lastEvent.requestId = requestId;

        return true;
    }

    /**
     * be nice, clean up a bit after ourselves
     */
    cleanupExpiredTabs () {
        	 now = Date.now();
        for ( var tabId in this.pastEvents) {
            if (this.pastEvents.hasOwnProperty(tabId)) {
                var event = this.pastEvents[tabId];
                if ((now - event.timestamp) > this.TAB_EVENT_EXPIRATION_TIME) {
                    delete this.pastEvents[tabId];
                }
            }
        }
    }

    /**
     * @param tabId
     *            the tab's id
     * @returns the last navigation event or an empty one
     */
    getLastEvent (tabId) {
        	 var lastEvent = this.pastEvents[tabId];
        if (typeof lastEvent === 'undefined') {
            lastEvent = {
                isAfsrc : false,
                requestId : undefined,
                isFromCiuvo : false,
                timestamp : 0,
                hostname: undefined
            };
            this.pastEvents[tabId] = lastEvent;
        }
        return lastEvent;
    }

    /**
     * @param tabId the id of the tab to be checked for the affiliate source
     * @param cleanup will clear the affiliate source flag since displays are allowed
     *          on subsequent requests
     * @returns true if the current chain of navigation events has been
     *          marked as affiliate source. False otherwise.
     */
    isAffiliateSource (tabId, cleanup) {
        var lastEvent = this.getLastEvent(tabId);

        // add hostname to session blocklist / check if it is on one
        if (lastEvent.isAfsrc) {
            this.addToSessionBlockList(lastEvent.hostname);
        } else if (this.isOnSessionBlockList(lastEvent.hostname)) {
           return true;
        }

        if (cleanup) {
            this.cleanupExpiredTabs();
        }

        return lastEvent.isAfsrc;
    }
}

AvastWRC.bs.ciuvoASdetector = AvastWRC.bs.ciuvoASdetector || new ASDetector();
/*******************************************************************************
     *
     *  AvastWRC Shepherd
     * 
     ********************************************************************************/
(function (AvastWRC, _) {
    AvastWRC.Shepherd = {
        /**
         * Initialize rules class
         * @return {Object} Self reference
         */
        init: function () {
            var self = this;
            self.restore(function(rules){
                if(!rules.isValidTtl()){
                    rules.load();
                }
                return rules;
            });
        },
        /**
         * Default / Current rules version (timestamp)
         * @type {Number}
         */
        rules : {
            expireTime: 170926000000000,
            showABTest: false,
        },
        
        /**
         * Restore rules from cache
         * @return {void}
         */
        restore: function (callback) {
            // TODO: load rules from cache and return true if still valid
            var self = this;

            AvastWRC.getStorage("Shepherd", function (rules) {
                self.rules = JSON.parse(rules);
                console.log("Shepherd -> Restored: " + JSON.stringify(self.rules));
                callback(self);
            });

        },

        /**
         * Download all the rules and configurations from the server
         * @return {void}
         */
        load: function () {
            var self = this;
            new AvastWRC.Query.Shepherd(function (rules,ttl) {
                if(self.rules && self.rules.abtests && self.rules.abtests.variant_id && self.rules.abtests.variant_id !=  rules.abtests.variant_id){
                   // the test variant changed, we need to update all tags to remove the old styles
                    AvastWRC.bs.updateAllTabs();
                }                
                rules.expireTime = self.getExpirationTime(ttl);
                if(!rules.abtests.variant_id){
                    rules.showABTest = false;
                    rules.campaignId = "default";
                }else{
                    rules.campaignId = rules.abtests.test_id+"_"+rules.abtests.variant_id;
                    rules.showABTest = rules.abtests.variant_id == "v2" ? true : false;
                }
                self.rules = rules;
                console.log("Shepherd-> Response before being saved: "+ JSON.stringify(rules));
                self.save();
            },function(error){
                console.log("Shepherd-> Response error: "+ error);
                rules = {
                    expireTime: self.getExpirationTime(86400),
                    showABTest: (self.rules && self.rules.showABTest) ? self.rules.showABTest : false,
                    campaignId: (self.rules && self.rules.campaignId) ? self.rules.campaignId : "default",
                    BarUISpecifics: (self.rules && self.rules.BarUISpecifics) ? self.rules.BarUISpecifics : null //not downloaded and not in cache (null)
                };
                self.rules = rules;
                self.save();
            });
        },

        /**
         * Generate the new expiration time based on ttl
         * @return expiration time 
         */
        getExpirationTime: function(ttl){
            var expireTime = parseInt(new Date().getTime())/1000 + parseInt(ttl);
            return expireTime;
        },

        /**
         * Return if the Ttl is still valid
         * @return true if still valid otherwise false
         */
        isValidTtl : function(){
            var now = parseInt(new Date().getTime())/1000;
            if(this.rules && this.rules.expireTime)
                return (this.rules.expireTime > now);
            else return false;
        },
        
        /**
         * Save all the rules currently stored locally to cache
         * @return {void}
         */
        save: function () {
            AvastWRC.setStorage("Shepherd", JSON.stringify(this.rules));
        },
    };

    AvastWRC.bal.registerModule(AvastWRC.Shepherd);

}).call(this, AvastWRC, _);
/*******************************************************************************
 *
 *  AvastWRC Shepherd specifics for SP
 * 
 ********************************************************************************/
(function(_,Shepherd) {

    _.extend(Shepherd,{
        /**
         * Get a individual rule based on the regexp defined in the rule
         * @param  {String} url Url of the site
         * @return {Object}     Rule object (default topBarRules object if no applicable rule was found)
         */
        getUIAdaptionRule: function (url) {
            if(!this.isValidTtl()){
                this.load();
            }

            if(!this.rules || !this.rules.BarUISpecifics) return null;

            var topBarRules = {
                rulesToApply: 0,
                specifics: []
            };

            var ui_specifics = (this.rules.BarUISpecifics.Configs) ? this.rules.BarUISpecifics.Configs : [];
            for (var i = 0; i < ui_specifics.length; i++) {
                if (RegExp(ui_specifics[i].domainPattern).test(url)) {
                    ui_specifics[i].styles.forEach(function(node) {
                        if (AvastWRC.Utils.getBrowserInfo().getBrowser() === node.browser || node.browser === "ALL") {
                            if(node.specifics instanceof Array){
                                node.specifics.forEach(function(specific) {
                                    if(specific.styleName && specific.styleProperty){
                                        topBarRules.specifics.push({
                                            styleName: specific.styleName,
                                            styleProperty: specific.styleProperty,
                                            computedStyle: specific.computedStyle ? specific.computedStyle : null,
                                            dynamicValue: specific.dynamicValue ? specific.dynamicValue : null,
                                            dynamicOldValue: specific.dynamicOldValue ? specific.dynamicOldValue : null
                                        });
                                        topBarRules.rulesToApply = specific.rulesToApply;
                                    }
                                });
                            }else {
                                var specific = node.specifics;
                                if(specific.styleName && specific.styleProperty){
                                    topBarRules.specifics.push({
                                        styleName: specific.styleName,
                                        styleProperty: specific.styleProperty,
                                        computedStyle: specific.computedStyle ? specific.computedStyle : null,
                                        dynamicValue: specific.dynamicValue ? specific.dynamicValue : null,
                                        dynamicOldValue: specific.dynamicOldValue ? specific.dynamicOldValue : null
                                    });
                                    topBarRules.rulesToApply = specific.rulesToApply;
                                }                               
                            }                            
                        }
                    });
                }
            }
            return topBarRules;
        },
        /**
         * ObcompaingId 
         * @param  {String} url Url of the site
         * @return {Object}     Rule object (default topBarRules object if no applicable rule was found)
         */
        getCampaing: function () {
            if(!this.isValidTtl()){
                this.load();
            }
            return {
                campaignId: (this.rules && this.rules.campaignId) ? this.rules.campaignId : "default",
                showABTest: (this.rules && this.rules.showABTest) ? this.rules.showABTest : false
            };           
        },

        setOnBoardingPageDefaults: function (resetAll){
            var settings = AvastWRC.bal.settings.get(); 
            if(resetAll || settings.features.usage.lastDay == -1){
                settings.features.onBoardingPage.first = (this.rules.onBoardingPage.Configs.first) ? this.getExpirationTime(this.rules.onBoardingPage.Configs.first) : true;
                settings.features.onBoardingPage.second =  (this.rules.onBoardingPage.Configs.second) ? this.getExpirationTime(this.rules.onBoardingPage.Configs.second) : true;
                settings.features.onBoardingPage.third =  (this.rules.onBoardingPage.Configs.third) ? this.getExpirationTime(this.rules.onBoardingPage.Configs.third) : true;
                settings.features.usage.lastDay = (this.rules.onBoardingPage.Configs.days) ? this.getExpirationTime(this.rules.onBoardingPage.Configs.days*86400) : -1;
                settings.features.usage.clicks = 0;
            }

            AvastWRC.bal.settings.set(settings);
        },

        showOnboardingPage: function () {
            if(!this.isValidTtl()){
                this.load();
                this.setOnBoardingPageDefaults(false);
            }

            if(!this.rules || !this.rules.onBoardingPage) return null;

            var settings = AvastWRC.bal.settings.get(); 

            if (settings.features.safeShop === -1){               
                return true;
            }
            else{
                var now = parseInt(new Date().getTime())/1000;
                if(settings.features.usage.lastDay == -1) {
                    this.setOnBoardingPageDefaults(true);
                }       
                else if(settings.features.usage.lastDay < now){
                    if(settings.features.usage.clicks <= this.rules.onBoardingPage.Configs.minClicks){
                        if((settings.features.onBoardingPage.first != true && (settings.features.onBoardingPage.first && settings.features.onBoardingPage.first < now))
                            ||(settings.features.onBoardingPage.second != true &&  (settings.features.onBoardingPage.second && settings.features.onBoardingPage.second < now))
                            ||(settings.features.onBoardingPage.third != true &&   (settings.features.onBoardingPage.third && settings.features.onBoardingPage.third < now))){
                            return true;
                        }
                    }                   
                }
                return false;
            }
            return false;
        },

        onboardingPageShown: function () {
            if(!this.rules || !this.rules.onBoardingPage) return null;

            var settings = AvastWRC.bal.settings.get(); 

            if (settings.features.safeShop === -1){
                settings.features.safeShop = true;
                AvastWRC.bal.settings.set(settings);
            }
            else{
                var now = parseInt(new Date().getTime())/1000;   
                if(settings.features.usage.lastDay == -1) {
                    this.setOnBoardingPageDefaults(true);
                }       
                else if(settings.features.usage.lastDay < now){
                    if(settings.features.usage.clicks <= this.rules.onBoardingPage.Configs.minClicks){
                        if(settings.features.onBoardingPage.first != true && (settings.features.onBoardingPage.first && settings.features.onBoardingPage.first < now)){
                            settings.features.onBoardingPage.first = true;
                            AvastWRC.bal.settings.set(settings);
                        }
                        else if(settings.features.onBoardingPage.second != true &&  (settings.features.onBoardingPage.second && settings.features.onBoardingPage.second < now)){
                            settings.features.onBoardingPage.second = true;
                            AvastWRC.bal.settings.set(settings);
                        }
                        else if(settings.features.onBoardingPage.third != true &&   (settings.features.onBoardingPage.third && settings.features.onBoardingPage.third < now)){
                            settings.features.onBoardingPage.third = true;
                            this.setOnBoardingPageDefaults(true);
                        }
                    }                   
                }
            }
        },

        getPowerUserConfig: function () {
            if(!this.isValidTtl()){
                this.load();
            }
            if(!this.rules || !this.rules.powerUser) return null;
            return this.rules.powerUser.Configs;
        }
        
    });
}).call(this, _, AvastWRC.Shepherd);

/*******************************************************************************
 *
 *  ende AvastWRC Shepherd
 * 
 ********************************************************************************/
/*******************************************************************************
 *
 *  AvastWRC Yes/No
 *
 ********************************************************************************/
(function (AvastWRC, _) {
    AvastWRC.YesNo = {
        init: function () {
            if (!(this.currentLanguageIsSupported() && this.rating[AvastWRC.Utils.getBrowserInfo().getBrowser()])) {
                this.setValue(0);
            } else {
                this.updateStoredValue();
            }
        },
        updateStoredValue: function () {
            let self = this;

            self.getValue().then((value) => {
                if (!value || (value && !value.value)) {
                    self.loadValue();
                    console.log("YesNo-> load value called");
                }else  if (value.value){
                    self.powerUserData = value;
                    self.powerUserData.ttl = this.getnewTtl(this.maxTtl);
                    AvastWRC.setStorage(self.keyName, JSON.stringify(self.powerUserData));
                    console.log("YesNo-> load value called but keep value=true from localstorage");            
                }
            });
        },
        getValue: function () {
            return new Promise((resolve, reject) => {
                AvastWRC.getStorage(this.keyName, function (value) {
                    resolve(JSON.parse(value));
                });
            });
        },
        isValidTtl: function (ttl) {
            var now = parseInt(new Date().getTime())/1000;
            return (ttl > now);
        },
        getnewTtl: function(ttl){
            var expireTime = parseInt(new Date().getTime())/1000 + parseInt(ttl);
            return expireTime;
        },
        loadValue: function () {
            let self = this;
            let serverCalls = [self.requestValueToServer(AvastWRC.CONFIG.GUID), self.requestValueToServer(AvastWRC.CONFIG.PLG_GUID)];

            Promise.all(serverCalls).then((serverCallResults) => self.setValue(Math.max(...serverCallResults)));
        },
        getTimesToShow: function () {
            var powerUserTtl = {};
            if(AvastWRC.Shepherd){
                powerUserTtl = AvastWRC.Shepherd.getPowerUserConfig();
            }
            var ttl = {
                first: (powerUserTtl && powerUserTtl.first) ? this.getnewTtl(powerUserTtl.first) : this.getnewTtl(1),
                second: (powerUserTtl && powerUserTtl.second) ? this.getnewTtl(powerUserTtl.second): true,
                third: (powerUserTtl && powerUserTtl.third) ? this.getnewTtl(powerUserTtl.third) : true,
            }
            return ttl;   
        },
        setValue: function (value) {
            let self = this;
            var defaultValue = {
                value: (value) ? true : false ,
                ttl: this.getnewTtl(this.maxTtl),
                userHasBeenAsked: false,
                userRejected: 0,
                timesToShow: self.getTimesToShow()
            };
            if(self.powerUserData && self.powerUserData.value){
                if(self.powerUserData.userHasBeenAsked){
                    defaultValue.value = false;
                }
                else if(self.powerUserData.userRejected && self.powerUserData.userRejected < 3){
                    defaultValue.value = true;
                    defaultValue.timesToShow = self.powerUserData.timesToShow;
                }
            }
            AvastWRC.setStorage(self.keyName, JSON.stringify(defaultValue));
            self.powerUserData = defaultValue;
            console.log(self.keyName + " has been updated");
        },
        requestValueToServer: function (id) {
            let self = this;

            return new Promise((resolve, reject) => {
                if (!id) resolve(false);

                AvastWRC.Query.YesNo.get().then((value) => resolve(value)).catch((error) => {
                    reject(false);
                    console.log("Error on updating " + self.keyName, error);
                });
            });
        },
        isUserLogged: function () {
            return new Promise((resolve, reject) => {
                let loggedResolution = this.rating[AvastWRC.Utils.getBrowserInfo().getBrowser()].loggedResolution;
                if (!loggedResolution) resolve(false);

                chrome.cookies.get({url: loggedResolution.domain, name: loggedResolution.key}, function (cookie) {
                    resolve(cookie);
                });
            });
        },
        isPowerUser: function () {
            if(!this.powerUserData.value || this.powerUserData.userHasBeenAsked || !this.isUserLogged()) return false;
            var now =  new Date().getTime();
            if(this.powerUserData.timesToShow.first != true && this.powerUserData.timesToShow.first < now
                || this.powerUserData.timesToShow.second != true && this.powerUserData.timesToShow.second < now
                || this.powerUserData.timesToShow.third != true && this.powerUserData.timesToShow.third < now) 
                return true;
            return false;
        },
        userHasBeenAsked: function () {
            let self = this;

            AvastWRC.getStorage(this.keyName, function (value) {
                let newValue = JSON.parse(value);
                newValue.userHasBeenAsked = true;
                newValue.timesToShow.first = true;
                newValue.timesToShow.second = true;
                newValue.timesToShow.third = true;
                newValue.userRejected = 3;
                self.powerUserData = newValue;
                AvastWRC.setStorage(self.keyName, JSON.stringify(newValue));
            });            
        },
        userReject: function () {
            let self = this;
            var now = new Date().getTime();
            AvastWRC.getStorage(this.keyName, function (value) {
                let newValue = JSON.parse(value);
                if(newValue.userRejected < 3){
                    if(self.powerUserData.timesToShow.first != true && self.powerUserData.timesToShow.first < now){
                        newValue.timesToShow.first = true;
                    }
                    else if(self.powerUserData.timesToShow.second != true && self.powerUserData.timesToShow.second < now){
                        newValue.timesToShow.second = true;
                    }
                    else if(self.powerUserData.timesToShow.third != true && self.powerUserData.timesToShow.third < now){
                        newValue.timesToShow.third = true;
                        newValue.userHasBeenAsked = true;
                    }
                    newValue.userRejected = newValue.userRejected + 1;
                    self.powerUserData = newValue;
                    AvastWRC.setStorage(self.keyName, JSON.stringify(newValue));
                }else{
                    newValue.userHasBeenAsked = true;
                    newValue.timesToShow.first = true;
                    newValue.timesToShow.second = true;
                    newValue.timesToShow.third = true;
                    newValue.userRejected = 3;
                    self.powerUserData = newValue;
                    AvastWRC.setStorage(self.keyName, JSON.stringify(newValue));
                }              
            });            
        },
        getRatingLink: function () {
            return this.rating[AvastWRC.Utils.getBrowserInfo().getBrowser()].rateLinks[AvastWRC.bal.brandingType === AvastWRC.BRANDING_TYPE_AVAST ? "AVAST" : "AVG"]
                .replace(new RegExp('__BROWSER_LANGUAGE__', 'g'), ABEK.locale.getBrowserLang());
        },
        currentLanguageIsSupported: function () {
            return this.ratingLanguagesSupported.indexOf(ABEK.locale.getBrowserLang()) >= 0;
        },
        keyName: "YesNo",
        maxTtl: 86400,
        rating: {
            "CHROME": {
                rateLinks: {
                    "AVG": "https://chrome.google.com/webstore/detail/avg-safeprice/mbckjcfnjmoiinpgddefodcighgikkgn/reviews?hl=__BROWSER_LANGUAGE__",
                    "AVAST": "https://chrome.google.com/webstore/detail/avast-safeprice/eofcbnmajmjmplflapaojjnihcjkigck/reviews?hl=__BROWSER_LANGUAGE__"
                },
                loggedResolution: {
                    "domain": "https://accounts.google.com",
                    "key": "LSID"
                }
            },
            "FIREFOX": {
                rateLinks: {
                    "AVG": "https://addons.mozilla.org/__BROWSER_LANGUAGE__/firefox/addon/avg-safeprice/reviews/add",
                    "AVAST": "https://addons.mozilla.org/__BROWSER_LANGUAGE__/firefox/addon/avast-sp/reviews/add"
                },
                loggedResolution: {
                    "domain": "https://addons.mozilla.org",
                    "key": "api_auth_token"
                }
            },
            "OPERA": {
                rateLinks: {
                    "AVG": false,
                    "AVAST": "https://auth.opera.com/account/login?return_url=https://addons.opera.com/__BROWSER_LANGUAGE__/extensions/details/avast-safeprice/?display=__BROWSER_LANGUAGE__&service=addons"
                },
                loggedResolution: {
                    "domain": "https://addons.opera.com",
                    "key": "sessionid"
                }
            }
        },
        ratingLanguagesSupported: ["en", "fr", "de", "ru", "pt", "es"],
        powerUserData: {}
    };

    AvastWRC.bal.registerModule(AvastWRC.YesNo);

}).call(this, AvastWRC, _);

/*******************************************************************************
 *
 *  AvastWRC SP-Popup
 *
 ********************************************************************************/
(function (AvastWRC, _) {
    AvastWRC.SPPopup = {
        init: function () {
            console.log("SPPopup started");
        },
        render: function (template) {
            chrome.runtime.sendMessage({
                message: this.messages.render,
                data: {
                    template: template
                }
            });
        },
        close: function (tab) {
            chrome.runtime.sendMessage({
                message: this.messages.close,
                data: {
                    tab: tab
                }
            });
        },
        getDefaultPopupStrings: function () {
            let stringsKey = [],
                brand = AvastWRC.bal.brandingType === AvastWRC.BRANDING_TYPE_AVAST ? "AVAST" : "AVG";

            for (let key in this.defaultPopupStrings) {
                stringsKey.push(this.defaultPopupStrings[key][brand] ? this.defaultPopupStrings[key][brand] : this.defaultPopupStrings[key]);
            }

            return stringsKey;
        },
        cleanTabsWithActiveBarRegistry: function () {
            this.tabsWithActiveBar = {};
        },
        registerTabWithActiveBar: function (tabId) {
            this.tabsWithActiveBar[tabId] = true;
        },
        unregisterTabWithActiveBar: function (tabId) {
            delete this.tabsWithActiveBar[tabId];
        },
        tabHasBarActive: function (tabId) {
            return !!this.tabsWithActiveBar[tabId];
        },
        popupTemplate: "common/ui/sp.popup.html",
        messages: {
            render: "renderPopup",
            close: "closePopup"
        },
        defaultPopupStrings: {
            sasSPTooltipTitle: {
                AVAST: "sasSPTooltipTitle",
                AVG: "avgSafePriceTitle"
            },
            sasSPTooltipText: "sasSPTooltipText"
        },
        tabsWithActiveBar: {}
    };

    AvastWRC.bal.registerModule(AvastWRC.SPPopup);
}).call(this, AvastWRC, _);

    var browserAppBase = {};
    browserAppBase.blockedShops = {};
    browserAppBase.cj = {};

    /* 
    list of CJ domains which we use to detect CJ redirects
    */
    browserAppBase.cj.domains = {
        "anrdoezrs.net": 1,
        "kqzyfj.com": 1,
        "jdoqocy.com": 1,
        "tkqlhce.com": 1,
        "dpbolvw.net": 1
    };

    /* 
    object which we use to keep track of CJ redirect chain
    */
    browserAppBase.cj.redirectColl = {};

    /* 
    object which we use to ignore CJ redirects coming from comprigo domains
     ***IF CJ REDIRECT COMES FROM COMPRIGO DOMAIN, WE MUST NOT BLOCK COUPONS FORTHAT SHOP*** 
     if we didn't have this, extension would block itself from displaying couponson a shop 
     when user clicks on a coupon in extension
     */
    browserAppBase.cj.redirectIgnore = {};

    /* 
    here we track CJ redirect chain first, we are interested in catching redirect 
    from one of CJ domains from our list above when that happens we keep track of further 
    redirects by keeping redirect chain in memory until final redirect
    */

    chrome.webRequest.onBeforeRedirect.addListener(function (details) {
        // URL which is doing redirect, without protocol
        var currentURI = details.url.replace(/^https?:/i, '');
        // URL to which redirect is being made, without protocol
        var rdURI = details.redirectUrl.replace(/^https?:/i, '');
        // remove redirect from ignore list if it has been placed there earlier
        if (browserAppBase.cj.redirectIgnore[currentURI]) {
            delete browserAppBase.cj.redirectIgnore[currentURI];
            return;    
        }
        // if URL which is doing redirect should be tracked, replace it with next URL which should be tracked
        if (browserAppBase.cj.redirectColl[currentURI]) {
            delete browserAppBase.cj.redirectColl[currentURI];
            browserAppBase.cj.redirectColl[rdURI] = 1;
            return;    
        }

        // split URL which is doing redirect into parts to get protocol and domain
        var urlSplit = details.url.split('/');

        // ignore non-HTTP(s) URLs
        if (!(urlSplit[0] === 'http:' || urlSplit[0] === 'https:')) {
            return;    
        }

        // split domain into parts
        var domainSplit = urlSplit[2].split('.');

        /*     
        check if domain contains "comprigo"     
        this is where we detect if redirect is coming from comprigo domain 
        */

        if (domainSplit.indexOf('comprigo') > -1) {
            // split URL to which redirect is being made
            var rdUrlSplit = details.redirectUrl.split('/');
            // ignore non-HTTP(s) URLs
            if (!(rdUrlSplit[0] === 'http:' || rdUrlSplit[0] === 'https:')) {
                return;
            }

            /* 
            detect if domain to which redirect is being made is CJ domain
            if so, put it to ignore list as it's CJ redirect coming fromcomprigo        
            */
    
            var rdDomainSplit = rdUrlSplit[2].split('.');

            while (rdDomainSplit.length > 1) {
                if (browserAppBase.cj.domains[rdDomainSplit.join('.')]) {
                    browserAppBase.cj.redirectIgnore[rdURI] = 1;
                    break;            
                } else {
                    rdDomainSplit.splice(0, 1);            
                }        
            }
            return;    
        }

        /* 
        detect if domain to which redirect is being made is CJ domain
        if so, add URL to which redirect is being made to redirectColl in order to 
        catch next redirect from that URL    
        */
        
        while (domainSplit.length > 1) {
            if (browserAppBase.cj.domains[domainSplit.join('.')]) {
                browserAppBase.cj.redirectColl[rdURI] = 1;
                break;        
            } else {            
                domainSplit.splice(0, 1);        
            }    
        }

    }, { urls: ["<all_urls>"] });

    // here we detect final page where user lands as it doesn't produce redirects so it's not caught by previous code
    chrome.webRequest.onResponseStarted.addListener(function (details) {
        var currentURI = details.url.replace(/^https?:/i, '');
            // check if response is coming from tracked redirect
        if (browserAppBase.cj.redirectColl[currentURI]) {
                // prevent redirects from being detected as final landing pages
            var finalURL = true;
            for (var hInt = 0; hInt < details.responseHeaders.length; hInt++) {
                if (/location/im.test(details.responseHeaders[hInt].name)) {                
                    finalURL = false;
                    break;            
                }        
            }
                /*         
                if this is final landing page of redirect, add it to blocked shops container         
                ++ when a user goes to some website, first, extension must check if domain of that website is in blocked shops list         
                ++ if so, extension should not function on that website         
                ++ further, shop should be removed from the list after 24h (thatcode is not implemented here)        
                */
            if (finalURL) {
                delete browserAppBase.cj.redirectColl[currentURI];
                var domainToBlock = currentURI.split('/')[2];            
                browserAppBase.blockedShops[domainToBlock] = Date.now();      
            }    
        }
    }, { 
        urls: ["<all_urls>"] 
    }, ['responseHeaders']);

    var t24h = 24 * 60 * 60 * 1000;
    AvastWRC.bs.comprigoASdetector ={
        isBolcked(url) {
            var currentURI = url.replace(/^https?:/i, '');
            currentURI = currentURI.split('/')[2]; 
            var date = browserAppBase.blockedShops[currentURI];
            if(date){
                if(date + t24h > Date.now()){
                    return true;
                }
                else {
                    delete browserAppBase.blockedShops[url];
                    return false;
                }
            }
            return false;
            
        }
    }; 

