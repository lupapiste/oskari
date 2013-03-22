/**
 * @class Oskari.statistics.bundle.patiopoc.PatioPocBundleInstance
 *
 * Sample extension bundle definition which inherits most functionalty
 * from DefaultExtension class.
 *
 */
Oskari.clazz.define('Oskari.statistics.bundle.patiopoc.PatioPocBundleInstance',
/**
 * @static constructor function
 */
function() {
    this.conf =  {
        "name": "patiopoc",
        "sandbox": "sandbox",
        "tileClazz": "Oskari.userinterface.extension.DefaultTile",
        //"flyoutClazz": null,
        "viewClazz": "Oskari.statistics.bundle.patiopoc.View"
    };
}, {
	"eventHandlers" : {
		/**
		 * @method userinterface.ExtensionUpdatedEvent
		 */
		'userinterface.ExtensionUpdatedEvent' : function(event) {

			var me = this, view = this.plugins['Oskari.userinterface.View'];

			if(event.getExtension().getName() != me.getName()) {
				// not me -> do nothing
				return;
			}

			var isShown = event.getViewState() != "close";

			view.showContent(isShown);

		}
	}

}, {
	"extend" : ["Oskari.userinterface.extension.DefaultExtension"]
});
