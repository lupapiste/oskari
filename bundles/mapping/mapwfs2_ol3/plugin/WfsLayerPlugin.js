/**
 * @class Oskari.mapframework.bundle.mapwfs2.plugin.WfsLayerPlugin
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.mapwfs2.plugin.WfsLayerPlugin',
    /**
     * @method create called automatically on construction
     * @static

     * @param {Object} config
     */

    function () {
        var me = this;

        me._clazz =
            'Oskari.mapframework.bundle.mapwfs2.plugin.WfsLayerPlugin';
        me._name = 'WfsLayerPlugin';

        // connection and communication
        me._connection = null;
        me._io = null;

        // state
        me.tileSize = null;
        me.zoomLevel = null;
        me._isWFSOpen = 0;

        // Manual refresh ui location
        me._defaultLocation = 'top right';

        // printing
        me._printTiles = {};

        // highlight enabled or disabled
        me._highlighted = true;

        me.errorTriggers = {
            connection_not_available: {
                limit: 1,
                count: 0
            },
            connection_broken: {
                limit: 1,
                count: 0
            }
        };

        me.activeHighlightLayers = [];


        me.tempVectorLayer = null;
        me._layers = {};
        //a hash for layers that are in the middle of the loading process
        me._layersLoading = {};

    }, {
        __layerPrefix: 'wfs_layer_',
        __typeHighlight: 'highlight',
        __typeNormal: 'normal',

        /**
         * @private @method _initImpl
         *
         * Initiliazes the connection to the CometD servlet and registers the domain model
         */
        _initImpl: function () {
            var me = this,
                config = me.getConfig(),
                layerModelBuilder,
                mapLayerService,
                portAsString,
                sandbox = me.getSandbox();
            me.createTileGrid();
            // service init
            if (config) {
                if (!config.hostname || config.hostname === 'localhost') {
                    // convenience so the host isn't required
                    config.hostname = location.hostname;
                }
                if (!config.port) {
                    // convenience so the port isn't required
                    config.port = '';
                    config.port += location.port;
                }
                // length check won't work if port is given as number
                portAsString = '';
                portAsString += config.port;
                if (portAsString.length > 0) {
                    config.port = ':' + config.port;
                }
                if (!config.contextPath) {
                    // convenience so the contextPath isn't required
                    config.contextPath = '/transport';
                }
                me._config = config;
            }
            me._connection = Oskari.clazz.create(
                'Oskari.mapframework.bundle.mapwfs2.service.Connection',
                me._config,
                me
            );
             me.WFSLayerService = Oskari.clazz.create(
            'Oskari.mapframework.bundle.mapwfs2.service.WFSLayerService', sandbox);

            sandbox.registerService(me.WFSLayerService);

            me._io = Oskari.clazz.create(
                'Oskari.mapframework.bundle.mapwfs2.service.Mediator',
                me._config,
                me
            );

            // register domain model
            mapLayerService = sandbox.getService(
                'Oskari.mapframework.service.MapLayerService'
            );
            if (mapLayerService) {
                mapLayerService.registerLayerModel(
                    'wfslayer',
                    'Oskari.mapframework.bundle.mapwfs2.domain.WFSLayer'
                );
                layerModelBuilder = Oskari.clazz.create(
                    'Oskari.mapframework.bundle.mapwfs2.domain.WfsLayerModelBuilder',
                    sandbox
                );
                mapLayerService.registerLayerModelBuilder(
                    'wfslayer',
                    layerModelBuilder
                );
            }

            //What's this do?
            me._visualizationForm = Oskari.clazz.create(
                'Oskari.userinterface.component.VisualizationForm'
            );
        },
        /**
         * @method _createControlElement
         * @private
         * Creates UI div for manual refresh/load of wfs layer,
         * where this plugin registered.
         */
        _createControlElement: function () {
            var me = this,
                sandbox = me.getSandbox(),
                el = jQuery('<div class="mapplugin mapwfs2plugin">' +
                '<a href="JavaScript: void(0);"></a>' +
                '</div>');
            var link = el.find('a');
            me._loc = Oskari.getLocalization('MapWfs2', Oskari.getLang() || Oskari.getDefaultLanguage());
            link.html(me._loc.refresh);
            el.attr('title', me._loc.refresh_title);
            me._bindLinkClick(link);
            el.mousedown(function (event) {
                event.stopPropagation();
            });
            return el;
        },

        _bindLinkClick: function (link) {
            var me = this,
                linkElement = link || me.getElement().find('a'),
                sandbox = me.getSandbox();
            linkElement.bind('click', function () {
                var event = sandbox.getEventBuilder('WFSRefreshManualLoadLayersEvent')();
                sandbox.notifyAll(event);
                return false;
            });
        },
        /**
         * @method refresh
         * Updates the plugins interface (hides if no manual load wfs layers selected)
         */
        refresh: function () {
            var me = this,
                sandbox = me.getMapModule().getSandbox(),
                layers = sandbox.findAllSelectedMapLayers(),
                i,
                isVisible = false;
            if(this.getElement()) {
                this.getElement().hide();
            }
            // see if there's any wfs layers, show element if so
            for (i = 0; i < layers.length; i++) {
                if (layers[i].hasFeatureData() &&  layers[i].isManualRefresh() ) {
                    isVisible = true;
                }
            }
            if(isVisible && this.getElement()){
                this.getElement().show();
            }
            me.setVisible(isVisible);

        },
        /**
         * @method inform
         * Inform the user how to manage manual refresh layers (only when 1st manual refresh layer in selection)
         */
        inform: function (event) {
            var me = this,
                config = me.getConfig(),
                sandbox = me.getMapModule().getSandbox(),
                layer = event.getMapLayer(),
                layers = sandbox.findAllSelectedMapLayers(),
                i,
                count = 0,
                render = false;

            if(config){
                render = config.isPublished;
            }

            // see if there's any wfs layers, show  if so
            for (i = 0; i < layers.length; i++) {
                if (layers[i].hasFeatureData() &&  layers[i].isManualRefresh() ) {
                   count++;
                }
            }
            if(count === 1 && layer.isManualRefresh()){
               me.showMessage(me.getLocalization().information.title, me.getLocalization().information.info, me.getLocalization().button.close, render);
            }
        },
        /**
         * @method register
         *
         * Registers plugin into mapModule
         */
        register: function () {
            this.getMapModule().setLayerPlugin('wfslayer', this);
        },

        /**
         * @method unregister
         *
         * Removes registration of the plugin from mapModule
         */
        unregister: function () {
            this.getMapModule().setLayerPlugin('wfslayer', null);
        },
        _createEventHandlers: function () {
            var me = this;

            return {
                /**
                 * @method AfterMapMoveEvent
                 */
                AfterMapMoveEvent: function () {
                    if (me.getConfig() && me.getConfig().deferSetLocation) {
                        me.getSandbox().printDebug(
                            'setLocation deferred (to aftermapmove)'
                        );
                        return;
                    }

                    me.mapMoveHandler();
                },

                /**
                 * @method AfterMapLayerAddEvent
                 * @param {Object} event
                 */
                AfterMapLayerAddEvent: function (event) {

                    me.mapLayerAddHandler(event);
                    // Refresh UI refresh button visible/invisible
                    me.refresh();
                    // Inform user, if manual refresh-load wfs layers in selected map layers
                    // (only for 1st manual refresh layer)
                    me.inform(event);
                },

                /**
                 * @method AfterMapLayerRemoveEvent
                 * @param {Object} event
                 */
                AfterMapLayerRemoveEvent: function (event) {

                    me.mapLayerRemoveHandler(event);
                    // Refresh UI refresh button visible/invisible
                    me.refresh();
                },

                /**
                 * @method WFSFeaturesSelectedEvent
                 * @param {Object} event
                 */
                WFSFeaturesSelectedEvent: function (event) {
                    me.featuresSelectedHandler(event);
                },

                /**
                 * @method MapClickedEvent
                 * @param {Object} event
                 */
                MapClickedEvent: function (event) {
                    me.mapClickedHandler(event);
                },

                /**
                 * @method AfterChangeMapLayerStyleEvent
                 * @param {Object} event
                 */
                AfterChangeMapLayerStyleEvent: function (event) {

                    me.changeMapLayerStyleHandler(event);
                },
                /**
                 * Refresh manual-refresh-flagged wfs layers
                 * @param event
                 * @constructor
                 */
                WFSRefreshManualLoadLayersEvent: function (event) {
                    me.refreshManualLoadLayersHandler(event);
                },
                /**
                 * @method MapLayerVisibilityChangedEvent
                 * @param {Object} event
                 */
                MapLayerVisibilityChangedEvent: function (event) {

                    me.mapLayerVisibilityChangedHandler(event);
                    if (event.getMapLayer().hasFeatureData() && me.getConfig() && me.getConfig().deferSetLocation) {
                        me.getSandbox().printDebug(
                            'sending deferred setLocation'
                        );
                        me.mapMoveHandler(event.getMapLayer().getId());
                    }
                },

                /**
                 * @method AfterChangeMapLayerOpacityEvent
                 * @param {Object} event
                 */
                AfterChangeMapLayerOpacityEvent: function (event) {

                    me.afterChangeMapLayerOpacityEvent(event);
                },

                /**
                 * @method MapSizeChangedEvent
                 * @param {Object} event
                 */
                MapSizeChangedEvent: function (event) {

                    me.mapSizeChangedHandler(event);
                },

                /**
                 * @method WFSSetFilter
                 * @param {Object} event
                 */
                WFSSetFilter: function (event) {

                    me.setFilterHandler(event);
                },

                /**
                 * @method WFSSetPropertyFilter
                 * @param {Object} event
                 */
                WFSSetPropertyFilter: function (event) {

                    me.setPropertyFilterHandler(event);
                },

                /**
                 * @method WFSImageEvent
                 * @param {Object} event
                 */
                WFSImageEvent: function (event) {
                    me.drawImageTile(
                        event.getLayer(),
                        event.getImageUrl(),
                        event.getBBOX(),
                        event.getSize(),
                        event.getLayerType(),
                        event.isBoundaryTile(),
                        event.isKeepPrevious()
                    );
                }
            };
        },

        _createRequestHandlers: function () {
            var me = this;

            return {
                ShowOwnStyleRequest: Oskari.clazz.create(
                    'Oskari.mapframework.bundle.mapwfs2.request.ShowOwnStyleRequestHandler',
                    me
                ),
                'WfsLayerPlugin.ActivateHighlightRequest': Oskari.clazz.create(
                    'Oskari.mapframework.bundle.mapwfs2.request.ActivateHighlightRequestHandler',
                    me
                )
            };
        },

        /**
         * @method getConnection
         * @return {Object} connection
         */
        getConnection: function () {
            return this._connection;
        },

        /**
         * @method getIO
         * @return {Object} io
         */
        getIO: function () {
            return this._io;
        },

        /**
         * @method getVisualizationForm
         * @return {Object} io
         */
        getVisualizationForm: function () {
            return this._visualizationForm;
        },

        /**
         * @method mapMoveHandler
         */
        mapMoveHandler: function (reqLayerId) {
            var me = this,
                sandbox = me.getSandbox(),
                map = sandbox.getMap(),
                srs = map.getSrsName(),
                bbox = me.ol2ExtentOl3Transform(map.getExtent()),
                zoom = map.getZoom(),
                geomRequest = false,
                grid,
                fids,
                layerId,
                layers = [],
                i,
                tiles,
                x;

            // clean tiles for printing
            me._printTiles = {};
            // Update layer tile grid

            // update location
            grid = this.getGrid();

            if(reqLayerId) {
                var layer = sandbox.findMapLayerFromSelectedMapLayers(reqLayerId);
                if(layer) {
                    layers.push(layer);
                }
            }
            else {
                layers = sandbox.findAllSelectedMapLayers();
            }
            for (i = 0; i < layers.length; i += 1) {
                if (layers[i].hasFeatureData()) {
                    // clean features lists
                    layers[i].setActiveFeatures([]);
                    if (grid !== null && grid !== undefined) {
                        layerId = layers[i].getId();
                        tiles = me.getNonCachedGrid(layerId, grid);
                        //TODO: is there any point whatsoever in even calling this, if there are no tiles to update?
                        //if (!tiles || tiles.length === 0) {
                        //    continue;
                        //}
                        me._layersLoading[layerId] = tiles.length;
                        me.getIO().setLocation(
                            layerId,
                            srs, [
                                bbox[0],
                                bbox[1],
                                bbox[2],
                                bbox[3]
                            ],
                            zoom,
                            grid,
                            tiles
                        );
                    }
                }
            }

            // update zoomLevel and highlight pictures
            // must be updated also in map move, because of hili in bordertiles
            me.zoomLevel = zoom;

            srs = map.getSrsName();
            bbox = map.getExtent();
            zoom = map.getZoom();

            // if no connection or the layer is not registered, get highlight with URL
            for (x = 0; x < me.activeHighlightLayers.length; x += 1) {
                if (me.getConnection().isLazy() &&
                    (!me.getConnection().isConnected() ||
                        !sandbox.findMapLayerFromSelectedMapLayers(me.activeHighlightLayers[x].getId()))) {

                    fids = me.activeHighlightLayers[x].getClickedFeatureIds();
                    me.removeHighlightImages(
                        me.activeHighlightLayers[x]
                    );
                    me.getHighlightImage(
                        me.activeHighlightLayers[x],
                        srs, [
                            bbox.left,
                            bbox.bottom,
                            bbox.right,
                            bbox.top
                        ],
                        zoom,
                        fids
                    );
                }
            }

            layers.forEach(function (layer) {
                if (layer.hasFeatureData()) {
                    fids = me.WFSLayerService.getSelectedFeatureIds(layer.getId());
                    me.removeHighlightImages(layer);
                    if (me._highlighted) {
                        me.getIO().highlightMapLayerFeatures(
                            layer.getId(),
                            fids,
                            false,
                            geomRequest
                        );
                    }
                }
            });
        },
        /**
         * @method ol2ExtentOl3Transform
         *
         * Transforms an ol2 - style extent object to an ol3 - style array. If extent is already in the array form, return the original.
         */
        ol2ExtentOl3Transform: function(ol2Extent) {
            if (ol2Extent && ol2Extent.hasOwnProperty('left') && ol2Extent.hasOwnProperty('bottom') && ol2Extent.hasOwnProperty('right') && ol2Extent.hasOwnProperty('top')) {
                return [
                    ol2Extent.left,
                    ol2Extent.bottom,
                    ol2Extent.right,
                    ol2Extent.top
                ];
            } else if (ol2Extent && ol2Extent.length && ol2Extent.length === 4) {
                //supposedly already in ol3 form -> just return as is.
                return ol2Extent;
            }
            return null;
        },
        /**
         * @method mapLayerAddHandler
         */
        mapLayerAddHandler: function (event) {
            var me = this,
                connection = me.getConnection(),
                layer = event.getMapLayer(),
                styleName = null;

            if (layer.hasFeatureData()) {
                if (connection.isLazy() && !connection.isConnected()) {
                    connection.connect();
                }

                me._isWFSOpen += 1;
                connection.updateLazyDisconnect(me.isWFSOpen());

                if (layer.getCurrentStyle()) {
                    styleName = layer.getCurrentStyle().getName();
                }
                if (styleName === null || styleName === undefined ||
                    styleName === '') {

                    styleName = 'default';
                }

                me._addMapLayerToMap(
                    layer,
                    me.__typeNormal
                ); // add WMS layer
                // send together
                connection.get().batch(function () {

                    me.getIO().addMapLayer(
                        layer.getId(),
                        styleName
                    );
                    me.mapMoveHandler(); // setLocation
                });
            }
        },

        /**
         * @method mapLayerRemoveHandler
         */
        mapLayerRemoveHandler: function (event) {
            var me = this,
                layer = event.getMapLayer();

            if (layer.hasFeatureData()) {
                me._isWFSOpen -= 1;
                me.getConnection().updateLazyDisconnect(me.isWFSOpen());
                // remove from transport
                me.getIO().removeMapLayer(layer.getId());
                // remove from OL
                me.removeMapLayerFromMap(layer);

                // clean tiles for printing
                me._printTiles[layer.getId()] = [];

                // delete possible error triggers
                delete me.errorTriggers[
                    'wfs_no_permissions_' + layer.getId()
                ];
                delete me.errorTriggers[
                    'wfs_configuring_layer_failed_' + layer.getId()
                ];
                delete me.errorTriggers[
                    'wfs_request_failed_' + layer.getId()
                ];
                delete me.errorTriggers[
                    'features_parsing_failed_' + layer.getId()
                ];
            }
        },

        /**
         * @method featuresSelectedHandler
         * @param {Object} event
         */
        featuresSelectedHandler: function (event) {

            if (!event.getMapLayer().hasFeatureData()) {
                // No featuredata available, return
                return;
            }
            var me = this,
                bbox,
                connection = me.getConnection(),
                sandbox = me.getSandbox(),
                map = sandbox.getMap(),
                layer = event.getMapLayer(),
                layerId = layer.getId(),
                srs,
                geomRequest = true,
                wfsFeatureIds = event.getWfsFeatureIds(),
                zoom;

            me.removeHighlightImages(layer);

            // if no connection or the layer is not registered, get highlight with URl
            if (connection.isLazy() && (!connection.isConnected() || !sandbox.findMapLayerFromSelectedMapLayers(layerId))) {
                srs = map.getSrsName();
                bbox = map.getExtent();
                zoom = map.getZoom();

                this.getHighlightImage(
                    layer,
                    srs, [
                        bbox.left,
                        bbox.bottom,
                        bbox.right,
                        bbox.top
                    ],
                    zoom,
                    wfsFeatureIds
                );
            }

            me.getIO().highlightMapLayerFeatures(
                layerId,
                wfsFeatureIds,
                false,
                geomRequest
            );
        },

        /**
         * @method mapClickedHandler
         * @param {Object} event
         */
        mapClickedHandler: function (event) {

            // don't process while moving
            if (this.getSandbox().getMap().isMoving()) {
                return;
            }
            var lonlat = event.getLonLat(),
                keepPrevious = event.getParams().ctrlKeyDown;

            var point =  new ol.geom.Point([lonlat.lon, lonlat.lat]);
            var geojson = new ol.format.GeoJSON(this.getMap().getView().getProjection());
            var pixelTolerance = 15;
            var json = {
                type: 'FeatureCollection',
                crs: this.getMap().getView().getProjection().getCode(),
                features: [{
                    type: 'Feature',
                    geometry: JSON.parse(geojson.writeGeometry(point)),
                    properties : {
                        // add buffer based on resolution
                        buffer_radius : this.getMap().getView().getResolution() * pixelTolerance
                    }
                }]
            };

            this.getIO().setMapClick({
                lon : lonlat.lon,
                lat : lonlat.lat,
                json : json
            }, keepPrevious);
        },

        /**
         * @method changeMapLayerStyleHandler
         * @param {Object} event
         */
        changeMapLayerStyleHandler: function (event) {

            if (event.getMapLayer().hasFeatureData()) {
                // render "normal" layer with new style
                var OLLayer = this.getOLMapLayer(
                    event.getMapLayer(),
                    this.__typeNormal
                );
                OLLayer.redraw();

                this.getIO().setMapLayerStyle(
                    event.getMapLayer().getId(),
                    event.getMapLayer().getCurrentStyle().getName()
                );
            }
        },

        /**
         * @method mapLayerVisibilityChangedHandler
         * @param {Object} event
         */
        mapLayerVisibilityChangedHandler: function (event) {
            if (event.getMapLayer().hasFeatureData()) {
                this.getIO().setMapLayerVisibility(
                    event.getMapLayer().getId(),
                    event.getMapLayer().isVisible()
                );
            }
        },

        /**
         * @method afterChangeMapLayerOpacityEvent
         * @param {Object} event
         */
        afterChangeMapLayerOpacityEvent: function (event) {

            var layer = event.getMapLayer(),
                layers,
                opacity;

            if (!layer.hasFeatureData()) {
                return;
            }
            opacity = layer.getOpacity() / 100;
            layers = this.getOLMapLayers(layer);
            layers.forEach(function (layer) {
                layer.setOpacity(opacity);
            });
        },
        /**
         * @method  refreshManualLoadLayersHandler
         * @param {Object} event
         */
        refreshManualLoadLayersHandler: function (event) {
            var bbox,
                grid,
                layerId,
                layers = [],
                me = this,
                map = me.getSandbox().getMap(),
                srs,
                tiles,
                zoom;

            me.getIO().setMapSize(event.getWidth(), event.getHeight());

            // update tiles
            srs = map.getSrsName();
            bbox = map.getExtent();
            zoom = map.getZoom();

            grid = me.getGrid();

            if(event.getLayerId()){

                layers.push(me.getSandbox().findMapLayerFromSelectedMapLayers(event.getLayerId()));
            }
            else {
                layers = me.getSandbox().findAllSelectedMapLayers();
            }

            layers.forEach(function (layer) {
                if (layer.hasFeatureData() && layer.isManualRefresh()) {
                    // clean features lists
                    layer.setActiveFeatures([]);
                    if (grid !== null && grid !== undefined) {
                        layerId = layer.getId();
                        tiles = me.getNonCachedGrid(layerId, grid);
                        me.getIO().setLocation(
                            layerId,
                            srs, [
                                bbox.left,
                                bbox.bottom,
                                bbox.right,
                                bbox.top
                            ],
                            zoom,
                            grid,
                            tiles,
                            true
                        );
                       // not in OL3 me._tilesLayer.redraw();
                    }
                }
            });
        },
        /**
         * @method mapSizeChangedHandler
         * @param {Object} event
         */
        mapSizeChangedHandler: function (event) {
            var bbox,
                grid,
                layerId,
                layers,
                me = this,
                map = me.getSandbox().getMap(),
                srs,
                tiles,
                zoom;


            me.getIO().setMapSize(event.getWidth(), event.getHeight());

            // update tiles
            srs = map.getSrsName();
            bbox = map.getExtent();
            zoom = map.getZoom();

            grid = me.getGrid();

            layers = me.getSandbox().findAllSelectedMapLayers();

            layers.forEach(function (layer) {
                if (layer.hasFeatureData()) {
                    // clean features lists
                    layer.setActiveFeatures([]);
                    if (grid !== null && grid !== undefined) {
                        layerId = layer.getId();
                        tiles = me.getNonCachedGrid(layerId, grid);
                        me.getIO().setLocation(
                            layerId,
                            srs, [
                                bbox.left,
                                bbox.bottom,
                                bbox.right,
                                bbox.top
                            ],
                            zoom,
                            grid,
                            tiles
                        );
                       // not in OL3 me._tilesLayer.redraw();
                    }
                }
            });
        },

        /**
         * @method setFilterHandler
         * @param {Object} event
         */
        setFilterHandler: function (event) {
            var WFSLayerService = this.WFSLayerService,
                layers = this.getSandbox().findAllSelectedMapLayers(),
                keepPrevious = this.getSandbox().isCtrlKeyDown(),
                geoJson = event.getGeoJson();

            this.getIO().setFilter(geoJson, keepPrevious);
        },

        /**
         * @method setPropertyFilterHandler
         * @param {Object} event
         */
        setPropertyFilterHandler: function (event) {

            /// clean selected features lists
            var me = this,
                layers = this.getSandbox().findAllSelectedMapLayers();

            layers.forEach(function (layer) {
                if (layer.hasFeatureData() &&
                    layer.getId() === event.getLayerId()) {
                    me.WFSLayerService.emptyWFSFeatureSelections(layer);
                }
            });

            me.getIO().setPropertyFilter(
                event.getFilters(),
                event.getLayerId()
            );
        },

        /**
         * @method setCustomStyle
         */
        setCustomStyle: function (layerId, values) {
            // convert values to send (copy the values - don't edit the original)
            this.getIO().setMapLayerCustomStyle(layerId, values);
        },


        /**
         * @method clearConnectionErrorTriggers
         */
        clearConnectionErrorTriggers: function () {
            this.errorTriggers.connection_not_available = {
                limit: 1,
                count: 0
            };
            this.errorTriggers.connection_broken = {
                limit: 1,
                count: 0
            };
        },

        /**
         * @method preselectLayers
         */
        preselectLayers: function (layers) {
            _.each(
                layers,
                function (layer) {
                    if (layer.hasFeatureData()) {
                        this.getSandbox().printDebug(
                            '[WfsLayerPlugin] preselecting ' + layer.getId()
                        );
                    }
                }
            );
        },

        /**
         * @method removeHighlightImages
         *
         * Removes a tile from the Openlayers map
         *
         * @param {Oskari.mapframework.domain.WfsLayer} layer
         *           WFS layer that we want to remove
         */
        removeHighlightImages: function (layer) {
            if (layer && !layer.hasFeatureData()) {
                return;
            }

            var me = this,
                layerName,
                layerPart = '(.*)',
                map = me.getMap(),
                removeLayers;

            if (layer) {
                layerPart = layer.getId();
            }

            layerName =  me.__layerPrefix + layerPart + '_' + me.__typeHighlight;


            removeLayers = me.getMapModule().getLayersByName(layerName);

            removeLayers.forEach(function (removeLayer) {
                me.getMap().removeLayer(removeLayer);
            });
        },

        /**
         * @method removeMapLayerFromMap
         * @param {Object} layer
         */
        removeMapLayerFromMap: function (layer) {
            var removeLayer = this._layers[layer.getId()];
            if (removeLayer) {
                me.getMap().removeLayer(removeLayer);
            }
        },

        /**
         * @method getOLMapLayers
         * @param {Object} layer
         */
        getOLMapLayers: function (layer) {
            if (layer && !layer.hasFeatureData()) {
                return;
            }

            var me = this,
                layerPart = '',
                wfsReqExp;

            if (layer) {
                layerPart = layer.getId();
            }
            wfsReqExp = new RegExp(
                this.__layerPrefix + layerPart + '_(.*)',
                'i'
            );
            return   me.getMapModule().getLayersByName(this.__layerPrefix + layerPart); //this.getMap().getLayersByName(wfsReqExp);
        },

        /**
         * @method getOLMapLayer
         * @param {Object} layer
         * @param {String} type
         */
        getOLMapLayer: function (layer, type) {
            if (!layer || !layer.hasFeatureData()) {
                return null;
            }

            var layerName = this.__layerPrefix + layer.getId() + '_' + type,
                wfsReqExp = new RegExp(layerName);

            return me.getMapModule().getLayersByName(layerName)[0]; //this.getMap().getLayersByName(wfsReqExp)[0];
        },

        /**
         * @method drawImageTile
         *
         * Adds a tile to the Openlayers map
         *
         * @param {Oskari.mapframework.domain.WfsLayer} layer
         *           WFS layer that we want to update
         * @param {String} imageUrl
         *           url that will be used to download the tile image
         * @param {OpenLayers.Bounds} imageBbox
         *           bounds for the tile
         * @param {Object} imageSize
         * @param {String} layerType
         *           postfix so we can identify the tile as highlight/normal
         * @param {Boolean} boundaryTile
         *           true if on the boundary and should be redrawn
         * @param {Boolean} keepPrevious
         *           true to not delete existing tile
         */
        drawImageTile: function (layer, imageUrl, imageBbox, imageSize, layerType, boundaryTile, keepPrevious) {
            //TODO: clean up this method.
            var me = this,
                map = me.getMap(),
                layerId = layer.getId(),
                layerIndex = null,
                layerName = me.__layerPrefix + layerId + '_' + layerType,
                layerScales,
                normalLayer,
                normalLayerExp,
                normalLayerIndex,
                highlightLayer,
                highlightLayerExp,
                BBOX,
                bboxKey,
                dataForTileTemp,
                style,
                tileToUpdate,
                boundsObj = imageBbox, //ol.Extent
                ols,
                wfsMapImageLayer,
                normalLayerExp = me.__layerPrefix + layerId + '_' + me.__typeNormal,
                normalLayer = me.getMapModule().getLayersByName(normalLayerExp)[0];  //map.getLayersByName(normalLayerExp);

            /** Safety checks */
            if (!imageUrl || !boundsObj) return;

            if (layerType === me.__typeHighlight) {
                ols = [imageSize.width,imageSize.height];  //ol.Size
                layerScales = me.getMapModule().calculateLayerScales(layer.getMaxScale(),layer.getMinScale());

                wfsMapImageLayer = new ol.layer.Image({
                    source: new ol.source.ImageStatic({
                        url: imageUrl,
                        imageExtent: boundsObj,
                        imageSize: ols,
                        logo: false

                    }),
                    title: layerName
                })

          /*      wfsMapImageLayer = new OpenLayers.Layer.Image(
                    layerName,imageUrl,
                    boundsObj, ols, {
                        scales: layerScales,
                        transparent: true,
                        format: 'image/png',
                        isBaseLayer: false,
                        displayInLayerSwitcher: false,
                        visibility: true,
                        buffer: 0 }
                ); */
                wfsMapImageLayer.opacity = layer.getOpacity() / 100;
               // map.addLayer(wfsMapImageLayer);
                me.getMapModule().addLayer(wfsMapImageLayer, layer, layerName);
                wfsMapImageLayer.setVisibility(true);
                // also for draw
                wfsMapImageLayer.redraw(true);

                // if removed set to same index [but if wfsMapImageLayer created
                // in add (sets just in draw - not needed then here)]
                if (layerIndex !== null && wfsMapImageLayer !== null) {
                    map.setLayerIndex(wfsMapImageLayer, layerIndex);
                }

                // highlight picture on top of normal layer images
                highlightLayerExp = me.__layerPrefix + layerId + '_' + me.__typeHighlight;
                highlightLayer = me.getMapModule().getLayersByName(highlightLayerExp)[0]; // map.getLayersByName(highlightLayerExp);

                if (normalLayer.length > 0 && highlightLayer.length > 0) {
                    normalLayerIndex = map.getLayerIndex(normalLayer[normalLayer.length - 1]);
                    map.setLayerIndex(highlightLayer[0],normalLayerIndex + 10);
                }
            } else { // "normal"
                bboxKey = this.bboxkeyStrip(boundsObj);

                //according to our bookkeeping the layer shouldn't be loading anymore...If it is though, probably should just assume the number of tiles to be loaded to zero...
                if (!me._layersLoading[layerId]) {
                    me._layersLoading[layerId] = 0;
                } else {

                }
                me._layersLoading[layerId]--;
                if (bboxKey) {
                    var src = normalLayer.getSource();
                    //TODO: move this block to a method of it's own maybe?
                    //TODO: And also, figure out if there's a cleaner way for getting the zxy for a single tile's extent...?
                    //TODO: and besides it ain't event working when there are multiple zooms or anything. Resort to bbox after all, eh?
                    /*
                    var grid = src.tileGrid;
                    var resolution = me.getMap().getView().getResolution();
                    var z = grid.getZForResolution(resolution);
                    var x, y;
                    //this should be a range where minx = maxx and miny = maxy (cos where getting the tilerange for exactly one tile)
                    var tileRange = grid.getTileRangeForExtentAndZ(boundsObj, z);
                    if (tileRange.minX === tileRange.maxX && tileRange.minY === tileRange.maxY) {
                        x = tileRange.minX;
                        y = tileRange.minY;
                    } else {
                        //probably in the middle of something
                        return;
                    }
                    var tileCoordKey = src.getKeyZXY(z, x, y);
                    */
                    if (src && src.tileCache) {
                        var tile;

//                        if (src.tileCache.containsKey(tileCoordKey)) {
//                            tile  = src.tileCache.get(tileCoordKey);
                        if (src.tileCache.containsKey(bboxKey)) {
                            tile = src.tileCache.get(bboxKey);
                            tile.isBoundaryTile = boundaryTile;
                            tile.getImage().src = imageUrl;
                            tile.state = ol.TileState.LOADED;
                            //tile.src_ = imageUrl;
                            //All tiles for this stint / this layer have finished loading -> tell the canvas to update
                            //TODO: figure out a safer way for bookkeeping. Guessing this might get screwed when there are multiple sequential zoomins / -outs / pans
                            if (me._layersLoading[layerId] === 0) {
                                var mapRenderer = me.getMap().getRenderer();
                                var layerRenderer = mapRenderer.getLayerRenderer(normalLayer);
                                //reset the renderers memory of it's tilerange as to make sure that our boundary tiles get drawn perfectly
                                layerRenderer.renderedCanvasTileRange_ = new ol.TileRange();
                                src.changed();
                            }
                        }
                    }
                }
            }
        },
        /**
         * @method _overrideGetTile
         * Overrides the get tile function for the given layer. Using bboxkey as the key to the cache instead of the tileCoordKey.
         */
        _overrideGetTile: function(openLayer) {
            //Would be nice to be able to provide this in the constructor. Can't, however.
            //TODO: check whether there's a cool way of getting the tileCoordKey based on the tile's bbox in drawTileImage-function.
            //If so, we probably wouldn't need to override this...
            openLayer.getSource().getTile = function(z, x, y, pixelRatio, projection) {
                var tileCoordKey = this.getKeyZXY(z, x, y);

                var tileCoord = [z, x, y];
                var urlTileCoord = this.getTileCoordForTileUrlFunction(
                    tileCoord, projection);
                /*
                var tileUrl = goog.isNull(urlTileCoord) ? undefined :
                    this.tileUrlFunction(urlTileCoord, pixelRatio, projection);
                */
                var tileUrl = !urlTileCoord ? undefined : this.tileUrlFunction(urlTileCoord, pixelRatio, projection);

                if (this.tileCache.containsKey(tileUrl)) {
                    return this.tileCache.get(tileUrl);
                }
                var tile = new this.tileClass(
                    tileCoord,
                    goog.isDef(tileUrl) ? ol.TileState.IDLE : ol.TileState.EMPTY,
                    goog.isDef(tileUrl) ? tileUrl : '',
                    this.crossOrigin,
                    this.tileLoadFunction);
                /*
                goog.events.listen(tile, goog.events.EventType.CHANGE,
                    this.handleTileChange_, false, this);
                */
                //use the bbox key as key to the tilecache instead of the zxy. Maybe reconsider this, there might be no advantage as to having bbox as the key, versus zxy...?
                if (!this.tileCache.containsKey(tileUrl)) {
                    this.tileCache.set(tileUrl, tile);
                }
                return tile;
            };

        },
        /**
         * @method _addMapLayerToMap
         *
         * @param {Object} layer
         * @param {String} layerType
         */
        _addMapLayerToMap: function (_layer, layerType) {
            if (!_layer.hasFeatureData()) {
                return;
            }

            var layerName =
                this.__layerPrefix + _layer.getId() + '_' + layerType,
                layerScales = this.getMapModule().calculateLayerScales(
                    _layer.getMaxScale(),
                    _layer.getMinScale()
                ),
                key,
                layerParams = _layer.getParams(),
                layerOptions = _layer.getOptions();

            // override default params and options from layer
            for (key in layerParams) {
                if (layerParams.hasOwnProperty(key)) {
                    defaultParams[key] = layerParams[key];
                }
            }
            for (key in layerOptions) {
                if (layerOptions.hasOwnProperty(key)) {
                    defaultOptions[key] = layerOptions[key];
                }
            }
            var projection = ol.proj.get(this.getMapModule().getMap().getView().getProjection());
            var projectionExtent = projection.getExtent();
            var me = this;
            var openLayer = new ol.layer.Tile({
                source: new ol.source.TileImage({   // XYZ and TileImage(  tried
                    //just return null to avoid calls to stupid urls. Tiles loaded asynchronously over websocket.
                    tileLoadFunction: function (imageTile, src) {
                        return null;
                    },
                    layerId: _layer.getId(),

                    //TODO: it might also be possible to just use the zxy key? In that way I guess we shouldn't even have to override this...
                    tileUrlFunction: function (tileCoord, pixelRatio, projection, theTile) {
                        var bounds = this.tileGrid.getTileCoordExtent(tileCoord);
//                        var bounds = me._getTileCoordExtent(me._tileGrid, tileCoord)//this.tileGrid.getTileCoordExtent(tileCoord);
                        var bboxKey = me.bboxkeyStrip(bounds);
                        return bboxKey;
                    },
                    projection: projection,
                    tileGrid: this._tileGrid
                })
            });
            //custom getTile function
            me._overrideGetTile(openLayer);
            openLayer.getSource().set('layerId',_layer.getId());
            openLayer.setOpacity(_layer.getOpacity() / 100);
            me.getMapModule().addLayer(openLayer, _layer, layerName);
            me._layers[openLayer.getSource().get('layerId')] = openLayer;
        },

        /**
         * @method createTileGrid
         *
         * Creates the base tilegrid for use with any Grid operations
         *
         */
        createTileGrid: function() {
            var me = this,
                extent = me.getMapModule().getExtent(),//sandbox.getMap().getExtent(),
                maxZoom = me.getMapModule().getMaxZoomLevel();
            this._tileGrid = new ol.tilegrid.createXYZ({
                extent:extent,//me.getMap().getView().calculateExtent(me.getMap().getSize()),
                maxZoom: maxZoom,//me.getMapModule().getMaxZoomLevel(),
                tileSize: [256,256]
            });

        },

        getTileSize: function () {
            //TODO: NO hardcoding!
            this.tileSize = [256, 256];
            return this.tileSize;
        },
        getGrid: function () {
            var me = this,
                sandbox = me.getSandbox(),
                resolution = me.getMap().getView().getResolution(),
                mapExtent = me.ol2ExtentOl3Transform(sandbox.getMap().getExtent()),
                z,
                tileGrid = this._tileGrid,
                grid = {
                    bounds: [],
                    rows: null,
                    columns: null
                },
                rowidx = 0,
                tileRangeExtent;
                z =  tileGrid.getZForResolution(resolution);
                //z = me._getZForResolution(tileGrid, resolution);
//                tileRangeExtent = this._getTileRangeForExtentAndResolution(tileGrid, mapExtent, resolution);//tileGrid.getTileRangeForExtentAndResolution(mapExtent, resolution);
                tileRangeExtent = tileGrid.getTileRangeForExtentAndResolution(mapExtent, resolution);
                for (var iy = tileRangeExtent.minY; iy <= tileRangeExtent.maxY; iy++) {
                    var colidx = 0;
                    for (var ix = tileRangeExtent.minX; ix <= tileRangeExtent.maxX; ix++) {
                        var zxy = [z,ix,iy];
                        var tileBounds = tileGrid.getTileCoordExtent(zxy);
//                        var tileBounds = me._getTileCoordExtent(me._tileGrid, zxy);
                        grid.bounds.push(tileBounds);
                        colidx++;
                    }
                    rowidx++;
                }
                grid.rows = rowidx;
                grid.columns = colidx;
                return grid;
        },
        /**
         * Checks at tile is ok.
         * @method _isTile
         * @private
         *
         * @param {Object} tile
         *
         * @return {Boolean} is tile ok
         */
         _isTile: function(tile){
            if (tile.bounds[0] === NaN)
                return false;
            if (tile.bounds[1] === NaN)
                return false;
            if (tile.bounds[2] === NaN)
                return false;
            if (tile.bounds[3] === NaN)
                return false;
            return true;
         },

        /*
         * @method getPrintTiles
         */
        getPrintTiles: function () {
            return this._printTiles;
        },

        /*
         * @method setPrintTile
         *
         * @param {Oskari.mapframework.domain.WfsLayer} layer
         *           WFS layer that we want to update
         * @param {OpenLayers.Bounds} bbox
         * @param imageUrl
         */
        setPrintTile: function (layer, bbox, imageUrl) {
            if (typeof this._printTiles[layer.getId()] === 'undefined') {
                this._printTiles[layer.getId()] = [];
            }
            this._printTiles[layer.getId()].push({
                'bbox': bbox,
                'url': imageUrl
            });
        },

        /*
         * @method getNonCachedGrid
         *
         * @param grid
         */
        getNonCachedGrid: function (layerId, grid) {
            var layer = this._layers[layerId],
            //    style = layer.getCurrentStyle().getName(),
                result = [],
                i,
                me = this,
                bboxKey,
                dataForTile;
            if (!layer) {
                return result;
            }
            for (i = 0; i < grid.bounds.length; i += 1) {
                bboxKey = me.bboxkeyStrip(grid.bounds[i]);
                //at this point the tile should already been cached by the layers getTile - function.
                if (layer.getSource().tileCache.containsKey(bboxKey)) {
                    var tile = layer.getSource().tileCache.get(bboxKey);
                    if ((tile && tile.state !== ol.TileState.LOADED) || tile.isBoundaryTile === true || tile.isBoundaryTile === undefined) {
                        tile.isBoundaryTile = false;
                        result.push(grid.bounds[i]);
                    }
                }
            }
            return result;
        },

        /*
         * @method isWFSOpen
         */
        isWFSOpen: function () {
            if (this._isWFSOpen > 0) {
                return true;
            }
            return false;
        },

        /*
         * @method getLayerCount
         */
        getLayerCount: function () {
            return this._isWFSOpen;
        },


        /**
         * @method _isArrayEqual
         * @param {String[]} current
         * @param {String[]} old
         *
         * Checks if the arrays are equal
         */
        isArrayEqual: function (current, old) {
            // same size?
            if (old.length !== current.length) {
                return false;
            }
            var i;
            for (i = 0; i < current.length; i += 1) {
                if (current[i] !== old[i]) {
                    return false;
                }
            }

            return true;
        },

        /**
         * @method getLocalization
         * Convenience method to call from Tile and Flyout
         * Returns JSON presentation of bundles localization data for
         * current language. If key-parameter is not given, returns
         * the whole localization data.
         *
         * @param {String} key (optional) if given, returns the value for key
         * @return {String/Object} returns single localization string or
         *      JSON object for complete data depending on localization
         *      structure and if parameter key is given
         */
        getLocalization: function (key) {
            if (!this._localization) {
                this._localization = Oskari.getLocalization('MapWfs2');
            }
            if (key) {
                return this._localization[key];
            }
            return this._localization;
        },

        /*
         * @method showErrorPopup
         *
         * @param {Oskari.mapframework.domain.WfsLayer} layer
         *           WFS layer that we want to update
         * @param {OpenLayers.Bounds} bbox
         * @param imageUrl
         */
        showErrorPopup: function (message, layer, once) {
            if (once) {
                if (this.errorTriggers[message]) {
                    if (this.errorTriggers[message].count >= this.errorTriggers[message].limit) {
                        return;
                    }
                    this.errorTriggers[message].count += 1;
                } else {
                    if (this.errorTriggers[message + '_' + layer.getId()]) {
                        return;
                    }
                    this.errorTriggers[message + '_' + layer.getId()] = true;
                }
            }

            var dialog = Oskari.clazz.create(
                    'Oskari.userinterface.component.Popup'
                ),
                popupLoc = this.getLocalization('error').title,
                content = this.getLocalization('error')[message],
                okBtn = dialog.createCloseButton(
                    this.getLocalization().button.close
                );

            if (layer) {
                content = content.replace(/\{layer\}/, layer.getName());
            }

            okBtn.addClass('primary');
            dialog.addClass('error_handling');
            dialog.show(popupLoc, content, [okBtn]);
            dialog.fadeout(5000);
        },
        /*
         * @method showMessage
         *
         * @param {String} message dialog title
         * @param {String} message  message to show to the user
         * @param {String} locale string for OK-button
         * @param {boolean} render manual refresh wfs layers in OK call back, if true
         */
        showMessage: function (title, message, ok, render) {
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup'),
                okBtn = Oskari.clazz.create('Oskari.userinterface.component.Button'),
                me = this,
                sandbox = me.getSandbox();
            okBtn.setTitle(ok);
            okBtn.addClass('primary');
            okBtn.setHandler(function () {
                if(render){
                    var event = sandbox.getEventBuilder('WFSRefreshManualLoadLayersEvent')();
                    sandbox.notifyAll(event);
                }
                dialog.close(true);
            });
            dialog.show(title, message, [okBtn]);
        },

        /**
         * @method getAllFeatureIds
         *
         * @param {Object} layer
         */
        getAllFeatureIds: function (layer) {
            var fids = layer.getClickedFeatureIds().slice(0),
                k;

            for (k = 0; k < layer.getSelectedFeatures().length; k += 1) {
                fids.push(layer.getSelectedFeatures()[k][0]);
            }
            return fids;
        },

        /**
         * @method getHighlightImage
         *
         * @param {Number} layerId
         * @param {String} srs
         * @param {Number[]} bbox
         * @param {Number} zoom
         * @param {String[]} featureIds
         *
         * sends message to /highlight*
         */
        getHighlightImage: function (layer, srs, bbox, zoom, featureIds) {
            // helper function for visibleFields
            var me = this,
                sandbox = me.getSandbox(),
                map = sandbox.getMap(),
                contains = function (a, obj) {
                    var i;

                    for (i = 0; i < a.length; i += 1) {
                        if (a[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                };

            if (!contains(me.activeHighlightLayers, layer)) {
                me.activeHighlightLayers.push(layer);
            }

            var imageSize = {
                    width: map.getWidth(),
                    height: map.getHeight()
                },
                params = '?layerId=' + layer.getId() +
                '&session=' + me.getIO().getSessionID() +
                '&type=' + 'highlight' +
                '&srs=' + srs +
                '&bbox=' + bbox.join(',') +
                '&zoom=' + zoom +
                '&featureIds=' + featureIds.join(',') +
                '&width=' + imageSize.width +
                '&height=' + imageSize.height,
                imageUrl = me.getIO().getRootURL() + '/image' + params;

            // send as an event forward to WFSPlugin (draws)
            var event = sandbox.getEventBuilder('WFSImageEvent')(
                layer,
                imageUrl,
                bbox,
                imageSize,
                'highlight',
                false,
                false
            );
            sandbox.notifyAll(event);
        },

        /**
         * Enable or disable WFS highlight
         *
         * @param highlighted Truth value of highlight activation
         */
        setHighlighted: function (highlighted) {
            this._highlighted = highlighted;
        },
        /**
         * Strip bbox for unique key because of some inaccucate cases
         * OL computation (init grid in tilesizes)  is inaccurate in last decimal
         * @param bbox
         * @returns {string}
         */
        bboxkeyStrip: function (bbox) {
            var stripbox = [];
            if (!bbox) return;
            for (var i = bbox.length; i--;) {
                stripbox[i] = bbox[i].toPrecision(13);
            }
            return stripbox.join(',');
        },
        hasUI: function() {
            return false;
        }



        /**
         * ol3 debug stuff we need to survive......
         */
         /*
        ,_getZForResolution: function(tileGrid, resolution) {
          var z = this._linearFindNearest(tileGrid.resolutions_, resolution, 0);
          if (z < tileGrid.minZoom) {
            z = tileGrid.minZoom;
          } else if (z > tileGrid.maxZoom){
            z = tileGrid.maxZoom;
          }
          return z;
        },
        _linearFindNearest: function(arr, target, direction) {


          if (!arr || arr.length === 0) {
            return -1;
          }
          var n = arr.length;
          if (arr[0] <= target) {
            return 0;
          } else if (target <= arr[n - 1]) {
            return n - 1;
          } else {
            var i;
            if (direction > 0) {
              for (i = 1; i < n; ++i) {
                if (arr[i] < target) {
                  return i - 1;
                }
              }
            } else if (direction < 0) {
              for (i = 1; i < n; ++i) {
                if (arr[i] <= target) {
                  return i;
                }
              }
            } else {
              for (i = 1; i < n; ++i) {
                if (arr[i] == target) {
                  return i;
                } else if (arr[i] < target) {
                  if (arr[i - 1] - target < target - arr[i]) {
                    return i - 1;
                  } else {
                    return i;
                  }
                }
              }
            }
            // We should never get here, but the compiler complains
            // if it finds a path for which no number is returned.
            return n - 1;
          }
        },
        _getTileCoordExtent: function(tileGrid, tileCoord, opt_extent) {
          var origin = tileGrid.getOrigin(tileCoord[0]);
          var resolution = tileGrid.getResolution(tileCoord[0]);
          var tileSize = ol.size.toSize(tileGrid.getTileSize(tileCoord[0]), tileGrid.tmpSize_);
          var minX = origin[0] + tileCoord[1] * tileSize[0] * resolution;
          var minY = origin[1] + tileCoord[2] * tileSize[1] * resolution;
          var maxX = minX + tileSize[0] * resolution;
          var maxY = minY + tileSize[1] * resolution;
          return this._createOrUpdateExtent(minX, minY, maxX, maxY, opt_extent);
        },
        _createOrUpdateExtent: function(minX, minY, maxX, maxY, opt_extent) {
          if (opt_extent) {
            opt_extent[0] = minX;
            opt_extent[1] = minY;
            opt_extent[2] = maxX;
            opt_extent[3] = maxY;
            return opt_extent;
          } else {
            return [minX, minY, maxX, maxY];
          }
        },
        _getTileRangeForExtentAndResolution: function(tileGrid, extent, resolution, opt_tileRange) {
            var tileCoord = [0, 0, 0];
            this._getTileCoordForXYAndResolution(tileGrid, extent[0], extent[1], resolution, false, tileCoord);
            var minX = tileCoord[1];
            var minY = tileCoord[2];
            this._getTileCoordForXYAndResolution(tileGrid, extent[2], extent[3], resolution, true, tileCoord);
            return this._createOrUpdateTileRange(minX, tileCoord[1], minY, tileCoord[2], opt_tileRange);
        },
        _getTileCoordForXYAndResolution: function(tileGrid, x, y, resolution, reverseIntersectionPolicy, opt_tileCoord) {
          var z = this._getZForResolution(tileGrid, resolution);
          var scale = resolution / tileGrid.getResolution(z);
          var origin = tileGrid.getOrigin(z);
          var tileSize = ol.size.toSize(tileGrid.getTileSize(z), tileGrid.tmpSize_);

          var adjustX = reverseIntersectionPolicy ? 0.5 : 0;
          var adjustY = reverseIntersectionPolicy ? 0 : 0.5;
          var xFromOrigin = Math.floor((x - origin[0]) / resolution + adjustX);
          var yFromOrigin = Math.floor((y - origin[1]) / resolution + adjustY);
          var tileCoordX = scale * xFromOrigin / tileSize[0];
          var tileCoordY = scale * yFromOrigin / tileSize[1];

          if (reverseIntersectionPolicy) {
            tileCoordX = Math.ceil(tileCoordX) - 1;
            tileCoordY = Math.ceil(tileCoordY) - 1;
          } else {
            tileCoordX = Math.floor(tileCoordX);
            tileCoordY = Math.floor(tileCoordY);
          }

          return this._createOrUpdateTileCoord(z, tileCoordX, tileCoordY, opt_tileCoord);
        },
        _createOrUpdateTileCoord: function(z, x, y, opt_tileCoord) {
          if (opt_tileCoord) {
            opt_tileCoord[0] = z;
            opt_tileCoord[1] = x;
            opt_tileCoord[2] = y;
            return opt_tileCoord;
          } else {
            return [z, x, y];
          }
        },
        _createOrUpdateTileRange: function(minX, maxX, minY, maxY, tileRange) {
          if (tileRange) {
            tileRange.minX = minX;
            tileRange.maxX = maxX;
            tileRange.minY = minY;
            tileRange.maxY = maxY;
            return tileRange;
          } else {
//            return new ol.TileRange(minX, maxX, minY, maxY);
            return {
                minX: minX, 
                maxX: maxX, 
                minY: minY, 
                maxY: maxY
            }
          }
        }
        */
    }, {
        extend: ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        protocol: [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    }
);