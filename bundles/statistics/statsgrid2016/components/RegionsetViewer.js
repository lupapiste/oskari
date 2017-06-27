Oskari.clazz.define('Oskari.statistics.statsgrid.RegionsetViewer', function(instance, sandbox) {
    this.instance = instance;
    this.sb = sandbox;
    this.service = sandbox.getService('Oskari.statistics.statsgrid.StatisticsService');

    this.LAYER_ID = 'STATS_LAYER';

    this._bindToEvents();
}, {
/****** PUBLIC METHODS ******/
    render: function(highlightRegion){
        var me = this;
        var sandbox = me.sb;
        var service = me.service;
        var currentRegion = service.getStateService().getRegionset();
        var state = service.getStateService();
        var ind = state.getActiveIndicator();

        if(!ind) {
            // remove layer
            sandbox.postRequestByName('MapModulePlugin.RemoveFeaturesFromMapRequest', [null, null, me.LAYER_ID]);
            return;
        }

        service.getIndicatorData(ind.datasource, ind.indicator, ind.selections, state.getRegionset(), function(err, data) {
            if(err) {
                Oskari.log('RegionsetViewer').warn('Error getting indicator data', ind.datasource, ind.indicator, ind.selections, state.getRegionset());
                sandbox.postRequestByName('MapModulePlugin.RemoveFeaturesFromMapRequest', [null, null, me.LAYER_ID]);
                return;
            }
            var classification = state.getClassificationOpts(ind.hash);
            var classify = service.getClassificationService().getClassification(data, classification);
            if(!classify) {
                Oskari.log('RegionsetViewer').warn('Error getting classification', data, classification);
                sandbox.postRequestByName('MapModulePlugin.RemoveFeaturesFromMapRequest', [null, null, me.LAYER_ID]);
                return;
            }
            var colors = service.getColorService().getColorsForClassification(classification);

            var regiongroups = classify.getGroups();

            var optionalStyles = [];

            regiongroups.forEach(function(regiongroup, index){
                regiongroup.forEach(function(region){
                    optionalStyles.push({
                        property: {
                            value: region,
                            key: 'id'
                        },
                        fill: {
                            color: '#' + colors[index]
                        },
                        stroke: {
                            color: '#000000',
                            width: (highlightRegion && (highlightRegion.toString() === region.toString())) ? 4 : 1
                        },
                        image: {
                            opacity: 0.8
                        }
                    });
                });
            });

            service.getRegions(currentRegion, function(er, regions){
                var features = [];
                regions.forEach(function(region){
                    features.push(region.geojson);
                });
                var geoJSON = {
                    'type': 'FeatureCollection',
                    'crs': {
                        'type': 'name',
                        'properties': {
                          'name': sandbox.getMap().getSrsName()
                        }
                      },
                      'features': features
                };
                var params = [geoJSON, {
                    clearPrevious: true,
                    featureStyle: {
                        fill: {
                            color: 'rgba(255,0,0,0.0)'
                        },
                        stroke : {
                            color: '#000000',
                            width: 1
                        }
                    },
                    optionalStyles: optionalStyles,
                    layerId: me.LAYER_ID
                }];
                sandbox.postRequestByName(
                    'MapModulePlugin.AddFeaturesToMapRequest',
                    params
                );
            });
        });
    },
/****** PRIVATE METHODS ******/
    /**
     * Listen to events that require re-rendering the UI
     */
    _bindToEvents : function() {
        var me = this;
        var sandbox = me.sb;
        var state = me.service.getStateService();

        me.service.on('StatsGrid.IndicatorEvent', function(event) {
            // if indicator is removed/added
            me.render();
        });

        me.service.on('StatsGrid.ActiveIndicatorChangedEvent', function(event) {
            // Always show the active indicator
            me.render(state.getRegion());
        });

        me.service.on('StatsGrid.RegionsetChangedEvent', function(event) {
            // Need to update the map
            me.render(state.getRegion());
        });

        me.service.on('StatsGrid.RegionSelectedEvent', function(event){
            me.render(event.getRegion());
        });

        me.service.on('StatsGrid.ClassificationChangedEvent', function(event) {
            // Classification changed, need update map
            me.render(state.getRegion());
        });

        me.service.on('FeatureEvent', function(event){
            if(event.getParams().operation !== 'click' || !event.hasFeatures()) {
                return;
            }

            // resolve region
            var features = event.getParams().features[0];
            var region = features.geojson.features[0].properties.id;

            state.selectRegion(region, 'map');
        });
    }

});