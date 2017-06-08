/**
 * @class Oskari.mapframework.bundle.toolbar.ToolbarBundle
 * Definition for bundle. See source for details.
 */
Oskari.clazz.define("Oskari.mapframework.bundle.toolbar.ToolbarBundle", function () {}, {
        "create": function () {
            var inst = Oskari.clazz.create("Oskari.mapframework.bundle.toolbar.ToolbarBundleInstance");
            return inst;
        },
        "update": function (manager, bundle, bi, info) {}
    },

    /**
     * metadata
     */
    {

        "protocol": ["Oskari.bundle.Bundle", "Oskari.mapframework.bundle.extension.ExtensionBundle"],
        "source": {

            "scripts": [{
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/instance.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/button-methods.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/default-buttons.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/AddToolButtonRequest.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/RemoveToolButtonRequest.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/ToolButtonStateRequest.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/SelectToolButtonRequest.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/ToolButtonRequestHandler.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/ShowMapMeasurementRequestHandler.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/event/ToolSelectedEvent.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/ToolbarRequest.js"
            }, {
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/request/ToolbarRequestHandler.js"
            }, {
                "type": "text/css",
                "src": "../../../../bundles/framework/resources/toolbar/css/toolbar.css"
            }],
            "locales": [{
                "lang": "am",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/am.js"
            }, {
                "lang": "cs",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/cs.js"
            }, {
                "lang": "da",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/da.js"
            }, {
                "lang": "de",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/de.js"
            }, {
                "lang": "en",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/en.js"
            }, {
                "lang": "es",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/es.js"
            }, {
                "lang": "et",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/et.js"
            }, {
                "lang": "fi",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/fi.js"
            }, {
                "lang": "hr",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/hr.js"
            }, {
                "lang": "hu",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/hu.js"
            }, {
                "lang": "lv",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/lv.js"
            }, {
                "lang": "nl",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/nl.js"
            }, {
                "lang": "pl",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/pl.js"
            }, {
                "lang": "pt",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/pt.js"
            }, {
                "lang": "ro",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/ro.js"
            }, {
                "lang": "rs",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/rs.js"
            }, {
                "lang": "sl",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/sl.js"
            }, {
                "lang": "sk",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/sk.js"
            }, {
                "lang": "sq",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/sq.js"
            }, {
                "lang": "sv",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/sv.js"
            }, {
                "lang": "uk",
                "type": "text/javascript",
                "src": "../../../../bundles/framework/toolbar/resources/locale/uk.js"
            }]
        },
        "bundle": {
            "manifest": {
                "Bundle-Identifier": "toolbar",
                "Bundle-Name": "toolbar",
                "Bundle-Author": [{
                    "Name": "jjk",
                    "Organisation": "nls.fi",
                    "Temporal": {
                        "Start": "2009",
                        "End": "2011"
                    },
                    "Copyleft": {
                        "License": {
                            "License-Name": "EUPL",
                            "License-Online-Resource": "http://www.paikkatietoikkuna.fi/license"
                        }
                    }
                }],
                "Bundle-Name-Locale": {
                    "fi": {
                        "Name": "Toolbar",
                        "Title": "Toolbar"
                    },
                    "en": {}
                },
                "Bundle-Version": "1.0.0",
                "Import-Namespace": ["Oskari"],
                "Import-Bundle": {}
            }
        },
        /**
         * @static
         * @property {String[]} dependencies
         */
        "dependencies": ["jquery"]
    });

/**
 * Install this bundle
 */
Oskari.bundle_manager.installBundleClass("toolbar", "Oskari.mapframework.bundle.toolbar.ToolbarBundle");
