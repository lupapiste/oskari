/**
 * @class Oskari.statistics.bundle.publishedgrid.PublishedGridBundleInstance
 *
 */
Oskari.clazz.define('Oskari.statistics.bundle.publishedgrid.PublishedGridBundleInstance',
    /**
     * @static constructor function
     */

    function () {
        this.conf = {
            "sandbox": "sandbox"
        };
        this.state = {};
    }, {
        __name: 'PublishedGrid',

        getName: function () {
            return this.__name;
        },

        init: function () {
            return null;
        },

        update: function () {},

        stop: function () {},

        start: function () {
            var me = this;
            // Do not start if we can't get the state.
            if (!me.state) {
                return;
            }

            me.gridVisible = null;
            var conf = me.conf;
            // Let's use statsgrid's locale files.
            // They are linked from the bundle.js file.
            var locale = Oskari.getLocalization('StatsGrid');
            var sandboxName = (conf ? conf.sandbox : null) || 'sandbox';
            var sandbox = Oskari.getSandbox(sandboxName);
            this.sandbox = sandbox;
            sandbox.register(this);

            sandbox.registerAsStateful(this.mediator.bundleId, this);

            // Show the grid on startup, defaults to true.
            var showGrid = ((me.state && me.state.gridShown !== undefined) ? me.state.gridShown : true);

            // Find the map module.
            var mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');
            this.mapModule = mapModule;

            // The container where the grid will be rendered to.
            var container = jQuery('<div class="publishedgrid"></div>');
            this.container = container;

            // Create the StatisticsService for handling ajax calls and common functionality.
            // Used in both plugins below.
            var statsService = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.StatisticsService', me);
            sandbox.registerService(statsService);
            this.statsService = statsService;

            var tooltipRequestHandler = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.request.TooltipContentRequestHandler', this);
            sandbox.addRequestHandler('StatsGrid.TooltipContentRequest', tooltipRequestHandler);

            var indicatorRequestHandler = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.request.IndicatorsRequestHandler', this);
            sandbox.addRequestHandler('StatsGrid.IndicatorsRequest', indicatorRequestHandler);

            // Get the stats layer.
            var statsLayer = me.sandbox.findMapLayerFromAllAvailable(me.state.layerId);
            if (!statsLayer) {
                return;
            }

            // Register grid plugin to the map.
            var gridConf = {
                'published': true,
                'state': me.state,
                'layer': statsLayer
            };
            var gridPlugin = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.plugin.ManageStatsPlugin', gridConf, locale);
            mapModule.registerPlugin(gridPlugin);
            mapModule.startPlugin(gridPlugin);
            this.gridPlugin = gridPlugin;

            // Register classification plugin to the map.
            var classifyPlugin = Oskari.clazz.create('Oskari.statistics.bundle.statsgrid.plugin.ManageClassificationPlugin', {
                'state': me.getState()
            }, locale);
            mapModule.registerPlugin(classifyPlugin);
            mapModule.startPlugin(classifyPlugin);
            this.classifyPlugin = classifyPlugin;

            var statsLayerPlugin = sandbox.findRegisteredModuleInstance('MainMapModuleStatsLayerPlugin');
            if (statsLayerPlugin) {
                // A sort of a hack to enable the hover and select controls in a published map.
                statsLayerPlugin._modeVisible = true;
            }
            me.createUI();
        },

        setState: function (state) {
            if (state) {
                this.gridPlugin.loadStateIndicators(state, this.container);
            }
        },

        getState: function () {
            return this.state;
        },

        /**
         * @method createUI
         * Creates the UI based on the given state (what indicators to use and so on).
         */
        createUI: function () {
            var me = this;

            // Makes some room in the DOM for the grid.
            me._toggleGrid(me.state.gridShown);

            // don't print this if there is no grid to be shown
            if (me.state.gridShown) {
                // Create the show/hide toggle button for the grid.
                me._createShowHideButton(me.container);
            }
            // Initialize the grid
            me.gridPlugin.createStatsOut(me.container);
            me._adjustDataContainer();
            me._adjustMapPluginLocations();
        },

        /**
         * Gets the instance sandbox.
         *
         * @method getSandbox
         * @return {Object} return the sandbox associated with this instance
         */
        getSandbox: function () {
            return this.sandbox;
        },

        isLayerVisible: function () {
            var ret = false,
                layer = this.sandbox.findMapLayerFromSelectedMapLayers(me.state.layerId);
            if (layer) {
                ret = true;
            }
            return ret;
        },

        /**
         * Returns the open indicators of the instance's grid plugin.
         *
         * @method getGridIndicators
         * @return {Object/null} returns the open indicators of the grid plugin, or null if no grid plugin
         */
        getGridIndicators: function () {
            return (this.gridPlugin ? this.gridPlugin.indicatorsMeta : null);
        },

        /**
         * @method _toggleGrid
         * @param {Boolean} show Shows the grid when true, hides it when false
         */
        _toggleGrid: function (show) {
            var me = this,
                elCenter = jQuery('.oskariui-center'), // the map column
                elLeft = jQuery('.oskariui-left'), // the grid column
                gridWidth = 40; // How wide the grid should be, in percentages.

            if (show) {
                elCenter.removeClass('span12');
                elCenter.width((100 - gridWidth) + '%');
                elLeft.removeClass('oskari-closed');
                elLeft.width(gridWidth + '%');
                elLeft.html(me.container);
            } else {
                elCenter.width('').addClass('span12');
                elLeft.addClass('oskari-closed');
                elLeft.width('');
                if (!elLeft.is(":empty")) {
                    elLeft.remove(me.container);
                }
            }

            me.gridVisible = show;

            // A hack to notify openlayers of map size change.
            var map = me.mapModule.getMap();
            map.updateSize();
        },

        /**
         * Creates a button to show/hide the grid.
         *
         * @method _createShowHideButton
         * @param {Object} elementToHide The element the button should hide.
         */
        _createShowHideButton: function (elementToHide) {
            var me = this;
            var buttonContainer = jQuery(me.mapModule.getMap().div);
            var button = jQuery(
                '<div id="publishedgridToggle" class="hidePublishedGrid"></div>'
            );

            button.click(function (event) {
                event.preventDefault();

                if (me.gridVisible) {
                    me.gridVisible = false;
                    jQuery(elementToHide).hide({
                        duration: 50,
                        complete: function () {
                            me._adjustDataContainer();
                        }
                    });
                    jQuery(this).removeClass('hidePublishedGrid').addClass('showPublishedGrid');
                } else {
                    me.gridVisible = true;
                    jQuery(elementToHide).show({
                        duration: 50,
                        complete: function () {
                            me._adjustDataContainer();
                        }
                    });
                    jQuery(this).removeClass('showPublishedGrid').addClass('hidePublishedGrid');
                }
            });

            buttonContainer.append(button);
        },
        _adjustDataContainer: function () {
            var content = jQuery('#contentMap'),
                contentWidth = content.width(),
                marginWidth = content.css('margin-left').split('px')[0];
            var maxContentWidth = jQuery(window).width() - marginWidth;

            var mapWidth = jQuery('#mapdiv').width(),
                mapHeight = jQuery('#mapdiv').height();

            // how many columns * 80px
            var gridWidth = this._calculateGridWidth(); //maxContentWidth - mapWidth;
            var gridHeight = mapHeight;

            var elLeft = jQuery('.oskariui-left');
            var elCenter = jQuery('.oskariui-center');

            if (this.gridVisible) {
                if (gridWidth > 400) {
                    gridWidth = 400;
                }
                elLeft.removeClass('oskari-closed');
                jQuery('#contentMap').width(gridWidth + mapWidth + 20);

                gridWidth = (gridWidth + 20) + 'px';
                gridHeight = gridHeight + 'px';
                mapWidth = mapWidth + 'px';
            } else {
                elLeft.addClass('oskari-closed');
                jQuery('#contentMap').width('');

                gridWidth = '0px';
                gridHeight = '0px';
                contentWidth = '100%';
            }
            elLeft.css({
                'width': gridWidth,
                'height': gridHeight,
                'float': 'left'
            }).addClass('published-grid-left');
            elCenter.css({
                'width': mapWidth,
                'float': 'left'
            }).addClass('published-grid-center');
            this.container.height(mapHeight);

        },
        _calculateGridWidth: function () {
            if (this.state && this.state.indicators != null) {
                //indicators + municipality (name & code)
                var columns = this.state.indicators.length + 2;
                //slickgrid column width is 80 by default
                return columns * 80;
            }
            return 160;
        },

        _adjustMapPluginLocations: function () {
            var zoomBar = jQuery('.mapplugin.pzbDiv');
            var panButtons = jQuery('.mapplugin.panbuttonDiv');
            var zoomBarTop;

            if (zoomBar && zoomBar.length && !panButtons.length) {
                zoomBar.css('top', '35px');
            }
        }

    }, {
        "protocol": ["Oskari.bundle.BundleInstance", 'Oskari.mapframework.module.Module']
    });
