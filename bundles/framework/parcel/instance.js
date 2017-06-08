/**
 * @class Oskari.mapframework.bundle.parcel.DrawingToolInstance
 *
 * This bundle listens for events that provide feature ID for parcels or register units
 * and loads the requested feature data. Features are shown on the map. Also, tools are provided
 * to split the feature areas. Provides means to save feature data to server by using WFST.
 * Also, uses ParcelInfo bundle to show area information.
 *
 * This bundle requires configurations in application config.json.
 * For example:
 *     "parcel": {
 *         "conf": {
 *             "queryUrl": "https://ws.nls.fi/ktjkii/wfs/wfs",
 *             "parcelFeatureType": "PalstanTietoja",
 *             "registerUnitFeatureType": "RekisteriyksikonTietoja",
 *             "hideSomeToolbarButtons": "hide",
 *             "transactionUrl": "",
 *             "proxyUrl": "proxy.cgi?url="
 *         }
 *     }
 * Above parameters are for:
 * * queryUrl - URL that is used for loading feature data
 * * parcelFeatureType - feature type that is used when parcels are requested for features
 * * registerUnitFeatureType - feature type that is used when register units are requested for features
 * * hideSomeToolbarButtons - hide means that hide some buttons of other bundles that may not be usefull
 *                            for this bundel from toolbar. If this parameter is left out or 'false' it
 *                            means that show all buttons of other bundles. For more specific implementation,
 *                            see {Oskari.mapframework.bundle.parcel.handler.ButtonHandler} init -function.
 * * transactionUrl - URL that is used for WFST saving. If not defined, queryUrl is used for this.
 *                    Notice, if queryUrl and transactionUrl differ WFST uses INSERT, otherwise UPDATE.
 * * proxyUrl - If set, OpenLayers uses this for proxy.
 *
 * Listens for events of other bundles that have name:
 * 'ParcelSelector.ParcelSelectedEvent' and 'ParcelSelector.RegisterUnitSelectedEvent'.
 * Sends events for other bundles:
 * {Oskari.mapframework.bundle.parcel.event.ParcelInfoLayerRegisterEvent}
 * and {Oskari.mapframework.bundle.parcel.event.ParcelInfoLayerUnregisterEvent}.
 */

Oskari.clazz.define("Oskari.mapframework.bundle.parcel.DrawingToolInstance",

    /**
     * @method create called automatically on construction
     * @static
     */
        function() {
        this._localization = null;
        this.sandbox = null;
        this.parcelService = undefined;
        this.idPrefix = 'parcel';
    }, {
        /**
         * @method getName
         * @return {String} the name for the component
         */
        getName : function() {
            return 'Parcel';
        },
        /**
         * @method getSandbox
         * @return {Oskari.mapframework.sandbox.Sandbox}
         */
        getSandbox : function() {
            return this.sandbox;
        },
        /**
         * @method getLocalization
         * Returns JSON presentation of bundles localization data for current language.
         * If key-parameter is not given, returns the whole localization data.
         *
         * @param {String} key (optional) if given, returns the value for key
         * @return {String/Object} returns single localization string or
         *      JSON object for complete data depending on localization
         *      structure and if parameter key is given
         */
        getLocalization : function(key) {
            if (!this._localization) {
                this._localization = Oskari.getLocalization(this.getName());
            }
            if (key) {
                if (this._localization && this._localization[key]) {
                    return this._localization[key];
                } else {
                    return key;
                }
            }
            return this._localization;
        },
        /**
         * @method showMessage
         * Shows user a message with ok button
         * @param {String} title popup title
         * @param {String} message popup message
         */
        showMessage : function(title, message) {
            var loc = this.getLocalization(),
                dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            okBtn.setTitle(loc.buttons.ok);
            okBtn.addClass('primary');
            okBtn.setHandler(function() {
                dialog.close(true);
            });
            dialog.show(title, message, [okBtn]);
        },
        /**
         * @method getService
         * Returns the parcels main service
         * @return {Oskari.mapframework.bundle.parcel.service.ParcelService}
         */
        getService : function() {
            return this.parcelService;
        },
        /**
         * @method getDrawPlugin
         * Returns reference to the draw plugin
         * @return {Oskari.mapframework.bundle.parcel.plugin.DrawPlugin}
         */
        getDrawPlugin : function() {
            return this.view.drawPlugin;
        },
        /**
         * @method getMainView
         * Returns reference to the main view
         * @return {Oskari.mapframework.bundle.parcel.view.MainView}
         */
        getMainView : function() {
            return this.view;
        },
        /**
         * @method update
         * implements BundleInstance protocol update method - does nothing atm
         */
        update : function() {
        },
        /**
         * @method start
         * implements BundleInstance protocol start methdod
         */
        start : function() {
            var loc = this.getLocalization('language');
            this.templateLanguageLink = jQuery('<a href="JavaScript:void(0);">' + loc.change + '</a>');
            // Should this not come as a param?
            var sandbox = Oskari.$('sandbox'),
                mapLayerService = sandbox.getService('Oskari.mapframework.service.MapLayerService'),
                me = this,
                i,
                layerId;
            this.sandbox = sandbox;
            if (me.conf && me.conf.proxyUrl) {
                // Use proxy if requesting features cross-domain.
                // Also, proxy is required to provide application specific authorization for WFS data.
                // Notice, OpenLayers will automatically encode URL parameters.
                OpenLayers.ProxyHost = me.conf.proxyUrl;
            }
            // Test
            // me.conf.wfstFeatureNS = 'http://www.oskari.org';
            // me.conf.wfstUrl =  '/web/fi/kartta?p_p_id=Portti2Map_WAR_portti2mapportlet&p_p_lifecycle=2&action_route=PreParcel';

            if(me.conf && me.conf.stickyLayerIds) {
                // Layer switch off disable
                for (i in me.conf.stickyLayerIds) {
                    layerId = me.conf.stickyLayerIds[i];
                    mapLayerService.makeLayerSticky(layerId,true);
                }
            }
            // back end communication
            me.parcelService = Oskari.clazz.create('Oskari.mapframework.bundle.parcel.service.ParcelService', me);
            me.sandbox.registerService(me.parcelService);
            // init loads the places
            me.parcelService.init();

            // handles parcels save form
            me.view = Oskari.clazz.create("Oskari.mapframework.bundle.parcel.view.MainView", me);
            me.view.start();

            // handles selection events related to parcels
            me.parcelSelectorHandler = Oskari.clazz.create("Oskari.mapframework.bundle.parcel.handler.ParcelSelectorHandler", me);
            me.parcelSelectorHandler.start();
            me.preparcelSelectorHandler = Oskari.clazz.create("Oskari.mapframework.bundle.parcel.handler.PreParcelSelectorHandler", me);
            me.preparcelSelectorHandler.start();
            // predefined parcel id
            if (me.conf && me.conf.initRef) {
                me.parcelSelectorHandler.loadParcel(me.conf.initRef);
            }
            // predefined part parcel (preparcel) plot id
            else if (me.conf && me.conf.pid) {
                me.preparcelSelectorHandler.loadPreParcel(me.conf.pid);
            }
            // Language control
            var loginBar = jQuery("#loginbar");
            loginBar.empty();
            var languageLink = this.templateLanguageLink.clone();
            languageLink.click(function(event){
                me._changeLanguage();
            });

            loginBar.append(languageLink);
        },
        /**
         * @method _changeLanguage
         * @private
         * Changes the application language between Finnish and Swedish.
         */
        _changeLanguage : function() {
            var me = this;
            var loc = me.getLocalization();
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            var okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
            okBtn.setTitle(loc.buttons.ok);
            okBtn.setHandler(function() {
                dialog.close();
                var language = Oskari.getLang();
                if (language === 'fi') {
                    window.open("?lang=sv","_self");
                } else {
                    window.open("?lang=fi","_self");
                }
            });
            var cancelBtn = dialog.createCloseButton(loc.buttons.cancel);
            cancelBtn.addClass('primary');
            var dialogText = loc.notification.language;
            dialog.show(dialogText.title, dialogText.confirm, [okBtn, cancelBtn]);
            dialog.makeModal();
        },
        /**
         * @method stop
         * implements BundleInstance protocol stop method - does nothing atm
         */
        stop : function() {
            this.sandbox = null;
        }
    }, {
        /**
         * @property {String[]} protocol
         * @static
         */
        protocol : ['Oskari.bundle.BundleInstance']
    });
