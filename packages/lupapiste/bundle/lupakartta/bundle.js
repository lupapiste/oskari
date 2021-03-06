/**
 * @class Oskari.sample.bundle.myfirstbundle.SimpleHelloWorldBundle
 *
 * Definition for bundle. See source for details.
 */
Oskari.clazz.define("Oskari.lupapiste.bundle.lupakartta.lupakarttaBundle",

/**
 * @method create called automatically on construction
 * @static
 */
function() {

}, {
	"create" : function() {
		var me = this;
		var inst = Oskari.clazz.create("Oskari.lupapiste.bundle.lupakartta.lupakarttaInstance");
		return inst;

	},
	"update" : function(manager, bundle, bi, info) {

	}
}, {

	"protocol" : ["Oskari.bundle.Bundle"],
	"source" : {

		"scripts" : [{
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/instance.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/plugin/Markers.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/request/ClearMapRequest.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/request/ClearMapRequestHandler.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/request/AddMarkerRequest.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/request/AddMarkerRequestHandler.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/event/PlaceSaved.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupakartta/event/FeaturesAdded.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../libraries/jsts/javascript.util.min.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../libraries/jsts/jsts-0.16.0.min.js"
		}, {
			"type" : "text/css",
			"src" : "../../../../bundles/lupapiste/lupakartta/resources/css/lupakartta.css"
	}]
	},
	"bundle" : {
		"manifest" : {
			"Bundle-Identifier" : "lupakartta",
			"Bundle-Name" : "lupakartta",
			"Bundle-Author" : [{
				"Name" : "ev",
				"Organisation" : "sito.fi",
				"Temporal" : {
					"Start" : "2012",
					"End" : "2013"
				},
				"Copyleft" : {
					"License" : {
						"License-Name" : "",
						"License-Online-Resource" : ""
					}
				}
			}],
			"Bundle-Name-Locale" : {
				"fi" : {
					"Name" : " style-1",
					"Title" : " style-1"
				},
				"en" : {}
			},
			"Bundle-Version" : "1.0.0",
			"Import-Namespace" : ["Oskari"],
			"Import-Bundle" : {}

		}
	},

	/**
	 * @static
	 * @property dependencies
	 */
	"dependencies" : []

});

Oskari.bundle_manager.installBundleClass("lupakartta", "Oskari.lupapiste.bundle.lupakartta.lupakarttaBundle");
