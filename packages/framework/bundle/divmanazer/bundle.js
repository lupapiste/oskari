/**
 * @class Oskari.userinterface.bundle.ui.UserInterfaceBundle
 *
 *
 */
Oskari.clazz.define("Oskari.userinterface.bundle.ui.UserInterfaceBundle", function() {

}, {
    /**
     * @method create creates an Oskari DIV Manager instance
     * @return {Oskari.userinterface.bundle.ui.UserInterfaceBundleInstance}
     */
    "create" : function() {

        return Oskari.clazz.create("Oskari.userinterface.bundle.ui.UserInterfaceBundleInstance");
    },
    /**
     * @method update called by the bundle manager to inform on changes in
     * bundlage
     */
    "update" : function(manager, bundle, bi, info) {

    }
}, {
    /**
     * @static
     * @property protocol protocols implemented by this bundle
     */
    "protocol" : ["Oskari.bundle.Bundle"],
    "source" : {
        /**
         * @static
         * @property source.scripts
         *
         */
        "scripts" : [{
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/instance.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/AddExtensionRequest.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/AddExtensionRequestHandler.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/RemoveExtensionRequest.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/RemoveExtensionRequestHandler.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/UpdateExtensionRequest.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/UpdateExtensionRequestHandler.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/ModalDialogRequest.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/request/ModalDialogRequestHandler.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/event/ExtensionUpdatedEvent.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Accordion.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/AccordionPanel.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/TabContainer.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/TabDropdownContainer.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/TabPanel.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Badge.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Alert.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Popup.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Overlay.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Button.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Form.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/UIHelper.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/FormInput.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Popover.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/Grid.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/GridModel.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/ProgressSpinner.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/VisualizationForm.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/visualization-form/AreaForm.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/component/visualization-form/LineForm.js"
        }, {
            "type" : "text/javascript",
			"src" : "../../../../bundles/framework/divmanazer/component/visualization-form/DotForm.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/extension/DefaultTile.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/extension/DefaultFlyout.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/extension/DefaultExtension.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/extension/DefaultView.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/extension/DefaultLayout.js"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/divman.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/accordion.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/tab.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/modal.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/badge.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/alert.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/forminput.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/grid.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/bundle/divmanazer/css/popup.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/button.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/overlay.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/visualizationform.css"
        }, {
            "type" : "text/css",
            "src" : "../../../../bundles/framework/resources/divmanazer/css/popover.css"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../libraries/raphaeljs/raphael.min.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../libraries/jquery/plugins/jquery-placeholder/jquery.placeholder.js"
        }/*, {
         "type" : "text/javascript",
         "src" : "../../../../resources/framework/bundle/divmanazer/js/jquery.event.drag-1.5.min.js"
         }*/],
        "locales" : [{
            "lang" : "fi",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/fi.js"
        }, {
            "lang" : "sv",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/sv.js"
        }, {
            "lang" : "en",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/en.js"
        }, {
            "lang" : "cs",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/cs.js"
        }, {
            "lang" : "de",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/de.js"
        }, {
            "lang" : "es",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/divmanazer/resources/locale/es.js"
        }]
    },
    "bundle" : {
        /**
         * @static
         * @property bundle.manifest
         */
        "manifest" : {
            "Bundle-Identifier" : "ui",
            "Bundle-Name" : "ui",
            "Bundle-Tag" : {
                "mapframework" : true
            },

            "Bundle-Author" : [{
                "Name" : "jjk",
                "Organisation" : "nls.fi",
                "Temporal" : {
                    "Start" : "2009",
                    "End" : "2011"
                },
                "Copyleft" : {
                    "License" : {
                        "License-Name" : "EUPL",
                        "License-Online-Resource" : "http://www.paikkatietoikkuna.fi/license"
                    }
                }
            }],
            "Bundle-Name-Locale" : {
                "fi" : {
                    "Name" : " kpI",
                    "Title" : " kpI"
                },
                "en" : {}
            },
            "Bundle-Version" : "1.0.0",
            "Import-Namespace" : ["Oskari"],
            "Import-Bundle" : {}
        }
    }
});

Oskari.bundle_manager.installBundleClass("divmanazer", "Oskari.userinterface.bundle.ui.UserInterfaceBundle");
