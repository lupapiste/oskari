/**
 * @class Oskari.mapframework.bundle.personaldata.PersonalDataBundle
 *
 * Definition for bundle. See source for details.
 */
Oskari.clazz.define("Oskari.mapframework.bundle.personaldata.PersonalDataBundle", function() {

}, {
	"create" : function() {
		var me = this;
		var inst = Oskari.clazz.create("Oskari.mapframework.bundle.personaldata.PersonalDataBundleInstance");
		return inst;

	},
	"update" : function(manager, bundle, bi, info) {

	}
}, {

	"protocol" : ["Oskari.bundle.Bundle", "Oskari.mapframework.bundle.extension.ExtensionBundle"],
	"source" : {

		"scripts" : [{
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/instance.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/Flyout.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/Tile.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/MyPlacesTab.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/MyViewsTab.js"
		}, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/lupapiste/lupapiste-personaldata/service/ViewService.js"
        }, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/PublishedMapsTab.js"
		}, {
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/AccountTab.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/lupapiste/lupapiste-personaldata/request/AddTabRequest.js"
        }, {
            "type" : "text/javascript",
            "src" : "../../../../bundles/lupapiste/lupapiste-personaldata/request/AddTabRequestHandler.js"
		}, {
		    "type" : "text/css",
		    "src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/css/personaldata.css"		  
		}],
		
		"locales" : [{
			"lang" : "fi",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/fi.js"
		}, {
			"lang" : "sv",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/sv.js"
		}, {
			"lang" : "en",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/en.js"
		}, {
			"lang" : "cs",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/cs.js"
		}, {
			"lang" : "de",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/de.js"
		}, {
			"lang" : "es",
			"type" : "text/javascript",
			"src" : "../../../../bundles/lupapiste/lupapiste-personaldata/resources/locale/es.js"
		}]
	},
	"bundle" : {
		"manifest" : {
			"Bundle-Identifier" : "lupapiste-personaldata",
			"Bundle-Name" : "lupapiste-personaldata",
			"Bundle-Author" : [{
				"Name" : "ejv",
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
	 * @property {String[]} dependencies
	 */
	"dependencies" : ["jquery"]

});

Oskari.bundle_manager.installBundleClass("lupapiste-personaldata", "Oskari.mapframework.bundle.personaldata.PersonalDataBundle");
