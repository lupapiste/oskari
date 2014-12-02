define([
	"oskari",
	"jquery-ui",
	"libraries/proj4js-1.0.1/proj4js-compressed",
	"css!resources/openlayers/theme/default/style.css",
	"libraries/OpenLayers/OpenLayers.2_13_1-full-map",
	// load ui-components
    "bundles/framework/bundle/divmanazer/component/Component",
	"bundles/framework/bundle/divmanazer/component/FormComponent",
    "bundles/framework/bundle/divmanazer/component/Accordion",
    "bundles/framework/bundle/divmanazer/component/AccordionPanel",
    "bundles/framework/bundle/divmanazer/component/TabContainer",
    "bundles/framework/bundle/divmanazer/component/TabDropdownContainer",
    "bundles/framework/bundle/divmanazer/component/TabPanel",
    "bundles/framework/bundle/divmanazer/component/Badge",
    "bundles/framework/bundle/divmanazer/component/Alert",
    "bundles/framework/bundle/divmanazer/component/Popup",
    "bundles/framework/bundle/divmanazer/component/Overlay",
    "bundles/framework/bundle/divmanazer/component/Button",
    "bundles/framework/bundle/divmanazer/component/Form",
    "bundles/framework/bundle/divmanazer/component/UIHelper",
    "bundles/framework/bundle/divmanazer/component/FormInput",
    "bundles/framework/bundle/divmanazer/component/Popover",
    "bundles/framework/bundle/divmanazer/component/Grid",
    "bundles/framework/bundle/divmanazer/component/GridModel",
    "bundles/framework/bundle/divmanazer/component/ProgressSpinner",
    "bundles/framework/bundle/divmanazer/component/VisualizationForm",
    "bundles/framework/bundle/divmanazer/component/visualization-form/AreaForm",
    "bundles/framework/bundle/divmanazer/component/visualization-form/LineForm",
    "bundles/framework/bundle/divmanazer/component/visualization-form/DotForm",
//    "libraries/raphaeljs/raphael_export_icons",
    "libraries/jquery/plugins/jquery-placeholder/jquery.placeholder",
    "css!resources/framework/bundle/divmanazer/css/visualizationform.css",
    "css!resources/framework/bundle/divmanazer/css/divman.css",
    "css!resources/framework/bundle/divmanazer/css/accordion.css",
    "css!resources/framework/bundle/divmanazer/css/tab.css",
    "css!resources/framework/bundle/divmanazer/css/modal.css",
    "css!resources/framework/bundle/divmanazer/css/badge.css",
    "css!resources/framework/bundle/divmanazer/css/alert.css",
    "css!resources/framework/bundle/divmanazer/css/forminput.css",
    "css!resources/framework/bundle/divmanazer/css/grid.css",
    "css!resources/framework/bundle/divmanazer/css/popup.css",
    "css!resources/framework/bundle/divmanazer/css/button.css",
    "css!resources/framework/bundle/divmanazer/css/overlay.css",
    "css!resources/framework/bundle/divmanazer/css/popover.css",
    "bundles/framework/bundle/divmanazer/locale/fi",
    "bundles/framework/bundle/divmanazer/locale/sv",
    "bundles/framework/bundle/divmanazer/locale/en",
    "bundles/framework/bundle/divmanazer/locale/cs",
    "bundles/framework/bundle/divmanazer/locale/de",
    "bundles/framework/bundle/divmanazer/locale/es"
], function(Oskari, jQuery) {
	Oskari.bundleCls('openlayers-default-theme');

	return Oskari.bundleCls("ol2").category({
		'__name': 'map-ol2',
		getName: function() {
			return this.__name;
		},
		create: function() {
			return this;
		},
		update: function(manager, bundle, bi, info) {

		},
		start: function() {
			var path = "/Oskari/resources/openlayers";
			OpenLayers.ImgPath = path + '/img/';
		},
		stop: function() {
			// delete OpenLayers...just joking
		}
	})
});