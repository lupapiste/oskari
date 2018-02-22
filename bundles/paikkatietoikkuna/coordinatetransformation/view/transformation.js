Oskari.clazz.define('Oskari.coordinatetransformation.view.transformation',
    function (instance) {
        var me = this;
        me.instance = instance;
        me.loc = me.instance.getLocalization("flyout");
        me.helper = me.instance.helper;
        me.isMapSelection = false;
        me.clipboardInsert = false;
        me.conversionContainer = null
        me.startingSystem = false;
        me.fileinput = Oskari.clazz.create('Oskari.userinterface.component.FileInput', me.loc);
        me.file = Oskari.clazz.create('Oskari.coordinatetransformation.view.filesettings', me.instance, me.loc);
        me.coordMap = {
            coordinates: []
        };

        me.inputTable = Oskari.clazz.create('Oskari.coordinatetransformation.component.table', this, me.loc );
        me.outputTable = Oskari.clazz.create('Oskari.coordinatetransformation.component.table', this, me.loc );

        me.inputSystem = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateSystemSelection', this);
        me.outputSystem = Oskari.clazz.create('Oskari.coordinatetransformation.component.CoordinateSystemSelection', this);

        me.sourceSelect = Oskari.clazz.create('Oskari.coordinatetransformation.component.SourceSelect', me.loc );

        me.file.create();
        me._userSelections = { import: null, export: null };
        me._template = {
            wrapper: jQuery('<div class="transformation-wrapper"></div>'),
            system: jQuery('<div class="systems"></div>'),
            title: _.template('<h4 class="header"><%= title %></h4>'),            
            transformButton: _.template(
                '<div class="transformation-button" style="display:inline-block;">' +
                    '<input class="primary" id="transform" type="button" value="<%= convert %> >>">' +
                '</div>'
            ),
            utilRow: _.template(
                '<div class="util-row">' +
                    '<input class="clear" type="button" value="<%= clear %> ">' +
                    '<input class="show" type="button" value="<%= show %> ">' +
                    // '<input id="overlay-btn" class="export" type="button" value="<%= fileexport %> ">' +
                '</div>'
            )
        }
    }, {
        getName: function() {
            return 'Oskari.coordinatetransformation.view.transformation';
        },
        getContainer: function () {
            return jQuery(this.conversionContainer);
        },
        createUI: function( container ) {
            this.conversionContainer = container;

            var inputTitle = this._template.title( { title: this.loc.title.input } );
            var resultTitle = this._template.title( { title: this.loc.title.result } ); 

            var inputTable = this.inputTable.create();
            var targetTable = this.outputTable.create();

            var transformButton = this._template.transformButton({ convert: this.loc.coordinatefield.convert });

            var utilRow = this._template.utilRow({
                clear: this.loc.utils.clear,
                show: this.loc.utils.show,
                fileexport: this.loc.utils.export
                });
                                                            
            var wrapper = this._template.wrapper.clone();
            var system = this._template.system.clone();
            if ( this.sourceSelect.getElement() ) {
                wrapper.append( this.sourceSelect.getElement() );
            }
            if ( this.inputSystem.getElement() ) {
                var element = this.inputSystem.getElement();
                element.attr('data-system', 'coordinate-input');
                element.prepend( inputTitle );
                system.append( element );
            }
            if ( this.outputSystem.getElement() ) {
                var element = this.outputSystem.getElement();
                element.attr('data-system', 'coordinate-output');
                element.prepend( resultTitle );
                system.append( element );
            }
            wrapper.append(system);
            this.fileinput.create();
            this.outputTable.getContainer().find( ".coordinatefield-table" ).addClass( 'target' );

            if ( this.fileinput.canUseAdvancedUpload() ) {
                var fileInputElement = this.fileinput.handleDragAndDrop( this.readFileData.bind( this ) );
            }
            wrapper.find( '.datasource-info' ).append( fileInputElement );

            wrapper.append( inputTable );
            wrapper.append( transformButton );
            wrapper.append( targetTable );
            wrapper.append( utilRow );


            jQuery(container).append(wrapper);

            this.handleClipboardPasteEvent();
            this.handleButtons();
            this.handleRadioButtons();
        },
        setVisible: function ( visible ) {
            if( !visible ) {
                this.getContainer().parent().parent().hide();
            } else {
                this.getContainer().parent().parent().show();
            }
        },
        /** 
         * @method validateData
         * check different conditions if data matches to them
         */
        validateData: function( data ) {
            var userSpec = this.getUserSelections().import;
            if( !userSpec ) {
                Oskari.log(this.getName()).warn("No specification for file-import");
            }
            var lonlatKeyMatch = new RegExp(/(?:lon|lat)[\:][0-9.]+[\,].*,?/g);
            var numericWhitespaceMatch = new RegExp(/^[0-9.]+,+\s[0-9.]+,/gmi)
            
            var matched = data.match( lonlatKeyMatch );
            var numMatch = data.match( numericWhitespaceMatch );

             if( matched !== null ) {
                return this.constructObjectFromRegExpMatch( matched, true );
            } else {
                if( numMatch !== null ) {
                    return this.constructObjectFromRegExpMatch( numMatch, false );
                }
            }
        },
        /** 
         * @method constructObjectFromRegExpMatch
         * @description constructs a object from string with lon lat keys
         */
        constructObjectFromRegExpMatch: function ( data, lonlat ) {
            var matchLonLat = new RegExp(/(lon|lat)[\:][0-9.]+[\,]?/g);
            var matchNumericComma = new RegExp(/([0-9.])+\s*,?/g);
            var numeric = new RegExp(/[0-9.]+/);
            var array = [];
            for ( var i = 0; i < data.length; i++ ) {
                var lonlatObject = {};

                if( lonlat ) {
                    var match = data[i].match(matchLonLat);
                } else {
                    var match = data[i].match(matchNumericComma);
                }
                var lonValue = match[0].match(numeric);
                var latValue = match[1].match(numeric);

                lonlatObject.lon = lonValue[0];
                lonlatObject.lat = latValue[0];
                array.push(lonlatObject);
            }
            return array;
        },
        getSelectionValue: function ( selectListInstance ) {
            return selectListInstance.getValue();
        },
        setSelectionValue: function ( selectInstance, value ) {
            selectInstance.setValue( value );
        },
        getCrsOptions: function () {
            var input = this.inputSystem.getSelectInstance();
            var target = this.outputSystem.getSelectInstance();

            var sourceSelection = this.getSelectionValue( input["geodetic-coordinate"] );
            var targetSelection = this.getSelectionValue( target["geodetic-coordinate"] );
            var sourceElevationSelection = this.getSelectionValue( input.elevation );
            var targetElevationSelection = this.getSelectionValue( target.elevation );

            var source = this.helper.getMappedEPSG( sourceSelection );
            var target = this.helper.getMappedEPSG( targetSelection );
            var sourceElevation = this.helper.getMappedEPSG( sourceElevationSelection );
            var targetElevation = this.helper.getMappedEPSG( targetElevationSelection );

            return options = {
                source: source,
                sourceElevation: sourceElevation,
                target: target,
                targetElevation: targetElevation
            }
        },
        /**
         * @method constructLonLatObjectFromArray
         * @description array -> object with lon lat keys
         */
        constructLonLatObjectFromArray: function ( data ) {
            var obj = {};
            if ( Array.isArray( data ) ) {
                for ( var i in data ) {
                    if( Array.isArray(data[i]) ) {
                        for ( var j = 0; j < data[i].length; j++ ) {
                            obj[i] = {
                                lon: data[i][0],
                                lat: data[i][1]
                            }
                        }
                    }
                }
            }
            return obj;
        },
        handleServerResponce: function ( response ) {
            var obj = this.constructLonLatObjectFromArray(response.coordinates);
            this.modifyCoordinateObject("output", obj);
        },
        /**
         * @method modifyCoordinateObject
         * @param {string} flag - coordinate array contains two objects, input & output - flag determines which one you interact with
         * @param {array} coordinates - an array containing objects with keys lon lat - one object for each coordinate pair
         * @description 
         */
        modifyCoordinateObject: function ( flag, coordinates ) {
            var data = this.coordMap.coordinates;
            var me = this;
            var actions = {
                'input': function () {
                    coordinates.forEach( function ( pair ) {
	                    data.push({
                            input: pair
                        });
                    });
                },
                'output': function () {
                    for ( var i = 0; i < Object.keys( coordinates ).length; i++ ) {
                        data[i].output = coordinates[i];
                    }
                },
                'clear': function () {
                    me.coordMap.coordinates.length = 0;
                }
            };
            if ( actions[flag] ) {
                actions[flag]();
            } else {
                return;
            }

            this.refreshTableData();
        },
        /**
         * @method refreshTableData
         * @description refreshes both input and output tables with current data
         */
        refreshTableData: function () {
            var inputData = [];
            var outputData = [];

            var data = this.coordMap.coordinates;

            data.map( function ( pair ) {
                if ( pair.input ) {
                    inputData.push( pair.input );
                }
                if ( pair.output ) {
                    outputData.push( pair.output );
                }
            });

            this.inputTable.render( inputData );
            this.outputTable.render( outputData );
        },
        /**
         * @method handleClipboardPasteEvent
         * Handles the paste event in the input table
         */
        handleClipboardPasteEvent: function () {
            var me = this;
            var cells = document.getElementsByClassName("cell");

            for( var i = 0; i < cells.length; i++ ) {
                cells[i].addEventListener('paste', function( e ) {
                    // Stop data actually being pasted into div
                    e.stopPropagation();
                    e.preventDefault();

                if( me.clipboardInsert === false ) {
                    return;
                }
                var clipboardData, pastedData;
                    // Get pasted data via clipboard API
                    clipboardData = e.clipboardData || window.clipboardData;
                    pastedData = clipboardData.getData('Text');

                    var dataJson = me.validateData( pastedData );
                    me.modifyCoordinateObject( "input", dataJson );
                });
            }
        },
        /**
         * @method readFileData
         * Pass this function as a callback to fileinput to get the file-data
         */
        readFileData: function( fileData ) {
            var dataJson = this.validateData( fileData );
            this.modifyCoordinateObject( dataJson );
        },
        /**
         * @method handleRadioButtons
         * Inits the on change listeners for the radio buttons
         */
        handleRadioButtons: function () {
            var me = this;
            var container = me.getContainer();
            var clipboardInfo = container.find('.coordinateconversion-clipboardinfo');
            var mapSelectInfo = container.find('.coordinateconversion-mapinfo')
            var fileInput = container.find('.oskari-fileinput');
            var importfile = me.file.getElement().import;
            jQuery('input[type=radio][name=load]').change(function() {
                if (this.value == '1') {
                    // me.showDialogue( importfile, false );
                    clipboardInfo.hide();
                    mapSelectInfo.hide();
                    fileInput.show();
                    me.isMapSelection = false;
                    me.clipboardInsert = false;
                }
                else if (this.value == '2') {
                    fileInput.hide();
                    mapSelectInfo.hide();
                    me.clipboardInsert = true;
                    clipboardInfo.show();
                    me.isMapSelection = false;
                }
                else if (this.value == '3') {
                    clipboardInfo.hide();
                    fileInput.hide();
                    mapSelectInfo.show(); 
                    me.isMapSelection = true;    
                }
                me.inputTable.isEditable( me.clipboardInsert );
            });
            jQuery('.selectFromMap').on("click", function() {
                me.instance.toggleViews("MapSelection");
                me.clipboardInsert = false;
            });
         },
        /**
         * @method selectMapProjectionValues
         * Inits the on change listeners for the radio buttons
         */
        selectMapProjectionValues: function () {
            var input = this.inputSystem.getSelectInstance();
            // EPSG-3067 settings
            var sourceSelection = this.setSelectionValue( input.datum, "DATUM_EUREF-FIN" );
            var sourceelevationSelection = this.setSelectionValue( input.coordinate, "KOORDINAATISTO_SUORAK_2D" );
            var sourceSelection = this.setSelectionValue( input.projection, "TM" );
            var sourceelevationSelection = this.setSelectionValue( input["geodetic-coordinate"], "ETRS-TM35FIN" );
        },
        /**
         * @method handleButtons
         */
        handleButtons: function () {
            var me = this;
            var container = me.getContainer();
            container.find('.clear').on("click", function () {
                me.modifyCoordinateObject('clear');
                me.helper.removeMarkers();
            });
            container.find('.show').on("click", function () {
                var rows = me.inputTable.getElements().rows;
                me.coordMap.coordinates.forEach( function ( pair ) {
                    me.helper.addMarkerForCoords( pair.input, me.startingSystem );
                });                
                me.instance.toggleViews("mapmarkers");
            });
            container.find('.export').on("click", function () {
                var exportfile = me.file.getElement().export;
                me.showDialogue( exportfile, true );
            });
            container.find('#transform').on("click", function () {
                var crs = me.getCrsOptions();
                var coordinateArray = [];

                me.coordMap.sourceCrs = crs.source;
                me.coordMap.targetCrs = crs.target;

                me.coordMap.coordinates.forEach( function ( pair ) {
                    var input = pair.input;
                    var inputCoordinates = [ Number(input.lon), Number(input.lat) ];
                    coordinateArray.push(inputCoordinates);
                });

                var payload = {
                    sourceCrs: crs.source,
                    sourceElevationCrs: crs.sourceElevation,
                    targetCrs: crs.target,
                    targetElevationCrs: crs.targetElevation,
                    coords: coordinateArray
                }
                me.instance.getService().getConvertedCoordinates( payload, me.handleServerResponce.bind( me ) );
            });
        },

        showDialogue: function( content, shouldExport ) {
            var jc = jQuery(content);
            var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            dialog.makeDraggable();
            dialog.createCloseIcon();
            if( shouldExport ) {
                dialog.show(this.loc.filesetting.export.title, jc);
                this.file.getExportSettings( this.exportFile.bind(this), dialog.getJqueryContent(), dialog );
            } else {
                dialog.show(this.loc.filesetting.import.title, jc);
                this.file.getImportSettings(  this.importSettings.bind(this), dialog.getJqueryContent(), dialog );
            }
        },
        importSettings: function ( settings ) {
            this._userSelections = { "import": settings };
        },
        exportFile: function ( settings ) {
            var exportArray = [];
            this.coordMap.coordinates.forEach( function ( pair ) {
                exportArray.push( pair.input );
            });  
            if( exportArray.length !== 0 ) {
                this.fileinput.exportToFile( exportArray, settings.filename+'.txt' );
            } else {
                Oskari.log(this.getName()).warn("No transformed coordinates to write to file!");
            }
        },
        getUserSelections: function () {
            return this._userSelections;
        }
    }
);
 