/**
 * @class Oskari.mapframework.bundle.timeseries.TimeseriesPlayback
 *
 * Handles timeseries playback functionality.
 */
Oskari.clazz.define("Oskari.mapframework.bundle.timeseries.TimeseriesPlayback",

    /**
     * @method create called automatically on construction
     * @static
     * @param {Oskari.mapframework.bundle.routingUI.RoutingUIBundleInstance} instance
     */

    function (instance, conf, locale, mapmodule, sandbox) {
        this._TIMESERIES_INDEX = 'data-index';

        this.instance = instance;
        this.sandbox = sandbox;
        this.loc = locale;
        this.mapmodule = mapmodule;
        this.conf = conf;
        this.template = {};

        for (p in this.__templates) {
            if (this.__templates.hasOwnProperty(p)) {
                this.template[p] = jQuery(this.__templates[p]);
            }
        }
        this._control = null;

        this._playbackSlider = {
            times: [],
            differentDates: [],
            currentDate: null,
            currentDateIntervals: 0,
            hours: [],
            intervalCount: 0
        };

        this._animationSpeedMs = 1000;
        this._layerUpdateTimeMs = 500;
        this._timers = {
            popupPosition: null,
            slideInterval: null,
            updatemap: null
        };
        this._isDragging = false;
        this._isPopupMove = false;
        this._selectedLayerId = null;
    }, {

        __templates: {
            'control': jQuery('<div class="mapplugin timeseries">'+
                        '<div class="playback-button">'+
                            '<button class="play" name="play"></button>'+
                        '</div>'+
                        '<div class="playback-button">'+
                            '<button class="pause" name="pause"></button>'+
                        '</div>'+
                        '<div class="oskari-timeslider-empty">&nbsp;</div>'+
                        '<div class="oskari-timeslider"></div>'+
                    '</div>'+
                    '<div class="mapplugin-timeseries-popup">'+
                        '<div class="arrow"></div>'+
                        '<div class="content"></div>'+
                    '</div>'),
            'intervalLineHighlight': '<div class="interval-line-highlight"><div class="label"></div><div class="line"></div></div>',
            'intervalLine': '<div class="interval-line"><div class="label"></div><div class="line"></div></div>'
        },
        /**
         * @method @public showSlider
         *
         * @param {String|Integer} layerId layer id to animate
         * @param {Object|Array} times times object {start:null,end:null,interval:null} or array
         * @param {Boolean} autoPlay if true, start playing other false
         */
        showSlider: function (layerId, times, autoPlay) {
            var me = this;
            var layer = me.sandbox.findMapLayerFromSelectedMapLayers(layerId);

            if(times===null || layerId === null || !layer || (Array.isArray(times) && times.length===0)) {
                return;
            }

            me._selectedLayerId = layerId;

            if(me._control === null) {
                me._control = this.template.control.clone();
                jQuery(me.mapmodule.getMapEl()).append(me._control);
            }

            me._resetPlaybackSliderVariables();
            me._calculateIntervals(times);
            me._setSliderHandlers();
            me._control.filter('.mapplugin-timeseries-popup').attr(me._TIMESERIES_INDEX, 0);
            me._calculatePopupPosition();
            me._addDayLines();
            me._addInternalLines();

            if(autoPlay) {
                me._startPlayback();
            }

        },
        /**
         * @method  @public removeSlider remove slider
         */
        removeSlider: function(){
            var me = this;
            if(me._control) {
                me._stopPlayback();
                me._control.remove();
                me._resetPlaybackSliderVariables();
            }

        },
        /**
         * @method  @private checkDifferentDates check different dates
         * @param  {Object} newDate new date
         */
        _checkDifferentDates: function(newDate){
            var me = this;
            if(me._playbackSlider.currentDate === newDate.format('DD.MM.YYYY')) {
                me._playbackSlider.currentDateIntervals++;
            } else {
                me._playbackSlider.differentDates.push({
                    date: me._playbackSlider.currentDate,
                    intervals: me._playbackSlider.currentDateIntervals
                });

                me._playbackSlider.currentDateIntervals = 1;
                me._playbackSlider.currentDate = newDate.format('DD.MM.YYYY');
            }
        },
        /**
         * @method  @private _checkHours check hours
         * @param  {Object} date     checked date
         * @param  {Integer} interval interval count
         */
        _checkHours: function(date, interval) {
            var me = this;
            if(date.millisecond() === 0 && date.second() === 0 && date.minute() === 0) {
                me._playbackSlider.hours.push({
                    value: date.format('HH:mm'),
                    intervals: interval
                });
            }
        },
        /**
         * @method  @private _resetPlaybackSliderVariables reset playback variables
         */
        _resetPlaybackSliderVariables: function() {
            var me = this;
            me._playbackSlider = {
                times: [],
                differentDates: [],
                currentDate: null,
                currentDateIntervals: 0,
                hours: [],
                intervalCount: 0
            };
        },
        /**
         * @method  @private _calculateIntervals calculate time inervals
         * @param  {Array} times times array
         */
        _calculateIntervals: function(times){
            var me = this;
            var startDate;
            var newDate;

            // Times variable is object
            if('object' === typeof times && !Array.isArray(times)) {
                var interval = moment.duration(times.interval);

                // start
                startDate = moment(times.start);
                me._playbackSlider.currentDate = startDate.format('DD.MM.YYYY');
                me._playbackSlider.times.push({
                    time: startDate.format('HH:mm'),
                    value: startDate.toISOString(),
                    date: startDate.format('DD.MM.YYYY')
                });
                me._playbackSlider.currentDateIntervals++;
                me._checkHours(startDate, me._playbackSlider.intervalCount);

                // End
                var endDate = moment(times.end);
                var loop = true;

                while(loop) {
                    me._playbackSlider.intervalCount++;
                    var lastDate = moment(me._playbackSlider.times[me._playbackSlider.times.length-1].value);
                    newDate = lastDate.add(interval);

                    if(newDate<=endDate) {
                        me._playbackSlider.times.push({
                            time: newDate.format('HH:mm'),
                            value: newDate.toISOString(),
                            date: newDate.format('DD.MM.YYYY')
                        });
                        me._checkDifferentDates(newDate);
                        me._checkHours(newDate, me._playbackSlider.intervalCount);
                    } else {
                        me._playbackSlider.differentDates.push({
                            date: newDate.format('DD.MM.YYYY'),
                            intervals: me._playbackSlider.currentDateIntervals
                        });

                        me._checkDifferentDates(newDate);
                        loop = false;
                    }

                    if(me._playbackSlider.intervalCount>1000) {
                        loop = false;
                    }
                }

                if(me._playbackSlider.differentDates.length === 0){
                    me._playbackSlider.differentDates.push({
                        date: me._playbackSlider.currentDate,
                        intervals: me._playbackSlider.currentDateIntervals
                    });
                }
            }
            // Times variable is array
            else if(Array.isArray(times)) {
                startDate = moment(times[0]);
                me._playbackSlider.currentDate = startDate.format('DD.MM.YYYY');

                for(var i=0;i<times.length;i++) {
                    newDate = moment(times[i]);

                    me._playbackSlider.times.push({
                        time: newDate.format('HH:mm'),
                        value: newDate.toISOString(),
                        date: newDate.format('DD.MM.YYYY')
                    });
                    me._checkDifferentDates(newDate);
                    me._checkHours(newDate, i+1);
                }
                // Add last values
                me._playbackSlider.differentDates.push({
                    date: newDate.format('DD.MM.YYYY'),
                    intervals: me._playbackSlider.currentDateIntervals
                });
                if(me._playbackSlider.differentDates.length === 0){
                    me._playbackSlider.differentDates.push({
                        date: me._playbackSlider.currentDate,
                        intervals: me._playbackSlider.currentDateIntervals
                    });
                }
            }
        },
        /**
         * @method  @private _goNext go next
         */
        _goNext: function(){
            var me = this;
            var popup = me._control.filter('.mapplugin-timeseries-popup');
            var popupIndex = parseInt(popup.attr(me._TIMESERIES_INDEX));
            if(isNaN(popupIndex)){
                return;
            }
            if(me._playbackSlider.times.length-1<popupIndex+1) {
                popup.attr(me._TIMESERIES_INDEX, -1);
                me._goNext();
            } else {
                popupIndex++;
                popup.attr(me._TIMESERIES_INDEX, popupIndex);
                me._calculatePopupPosition();
            }

        },
        /**
         * @method  @private _startPlayback start playback
         */
        _startPlayback: function(){
            var me = this;
            me._control.find('.playback-button .play').hide();
            me._control.find('.playback-button .pause').show();
            me._timers.slideInterval = setInterval(function(){
                me._goNext();
            }, me._animationSpeedMs);
        },
        /**
         * @method  _stopPlayback stop playback
         */
        _stopPlayback: function(){
            var me = this;
            me._control.find('.playback-button .pause').hide();
            me._control.find('.playback-button .play').show();
            clearInterval(me._timers.slideInterval);
        },
        /**
         * @method  @private _setSliderHandlers set button handlers
         */
        _setSliderHandlers: function(){
            var me = this;

            // Play button
            me._control.find('.playback-button .play').click(function(evt){
                evt.preventDefault();
                me._startPlayback();
            });

            // Pause button
            me._control.find('.playback-button .pause').click(function(evt){
                evt.preventDefault();
                me._stopPlayback();
            });


            // Slider click
            me._control.find('.oskari-timeslider').mousedown(function() {
                me._isDragging = false;
            }).mousemove(function() {
                me._isDragging = true;
            }).mouseup(function(e) {
                var wasDragging = me._isDragging;
                me._isDragging = false;
                if (!wasDragging) {
                    me._moveSlider(e);
                }
            });

            // Slider popup drag
            me._control.filter('.mapplugin-timeseries-popup').mousedown(function(){
                me._isPopupMove = true;
            }).mouseleave(function(){
                me._isPopupMove = false;
            }).mousemove(function(e){
                if(me._isPopupMove) {
                    me._moveSlider(e);
                }
            }).mouseup(function(){
                me._isPopupMove = false;
            });
        },
        /**
         * @method  @private _calculatePopupPosition calculate popup position
         */
        _calculatePopupPosition: function(){
            var me = this;
            var popup = me._control.filter('.mapplugin-timeseries-popup');

            var timeSlider = me._control.find('.oskari-timeslider');
            var timeSliderPosition = timeSlider.position();
            var sliderWidth = timeSlider.width();
            var sliderHeight = timeSlider.height();
            var popupIndex = parseInt(popup.attr(me._TIMESERIES_INDEX));
            if(isNaN(popupIndex)){
                return;
            }
            popup.hide();
            popup.find('.content').html(me._playbackSlider.times[popupIndex].time);

            var leftPopup = (sliderWidth / (me._playbackSlider.times.length - 1)) * (popupIndex) + timeSliderPosition.left - popup.width()/2 + me._control.find('.playback-button button').width() +1;

            var topPopup = sliderHeight + timeSliderPosition.top + 10;
            popup.css('left', leftPopup + 'px');
            popup.css('top', topPopup + 'px');
            popup.show();

            clearTimeout(me._timers.updatemap);

            // Update map
            me._timers.updatemap = setTimeout(function(){
                me._updateLayer(me._playbackSlider.times[popupIndex].value);
            }, me._layerUpdateTimeMs);
        },
        /**
         * @method  @private _updateLayer update layer
         * @param  {String} time time value
         */
        _updateLayer: function(time){
            var me = this;
            var updateRequestBuilder = me.sandbox.getRequestBuilder('MapModulePlugin.MapLayerUpdateRequest'),
                    updateRequest;
                updateRequest = updateRequestBuilder(me._selectedLayerId, true, {
                    'TIME': time
                });
                me.sandbox.request(me.instance, updateRequest);
        },
        /**
         * @method  @private _addDayLines add day lines to slider
         */
        _addDayLines: function() {
            var me = this;
            // If there is only one day then not add dayline
            if(me._playbackSlider.differentDates.length <= 1) {
                return;
            }
            var timeSlider = me._control.find('.oskari-timeslider');
            var timeSliderPosition = timeSlider.position();
            var sliderHeight = timeSlider.height();
            var sliderWidth = timeSlider.width();
            timeSlider.find('.interval-line-highlight').remove();
            var pixelsPerTimeSerie = sliderWidth / me._playbackSlider.times.length;

            var top = timeSliderPosition.top + 10;
            var prevLeft = timeSliderPosition.left;

            for(var i=0;i<me._playbackSlider.differentDates.length;i++) {
                var currentDate = me._playbackSlider.differentDates[i];
                var dayLine = me.template.intervalLineHighlight.clone();
                var label = dayLine.find('.label');
                label.html(currentDate.date);
                if(i>0) {
                    label.addClass('center');
                }
                dayLine.css('left', prevLeft + 'px' );
                prevLeft = (currentDate.intervals * pixelsPerTimeSerie + prevLeft);
                timeSlider.append(dayLine);
                var topPosition = top + sliderHeight - dayLine.height();
                dayLine.css('top', topPosition + 'px');
            }
        },
        /**
         * @method  @private _addInternalLines add internal lines
         */
        _addInternalLines: function(){
            var me = this;
            // If there is only one one hour then not add internal lines
            if(me._playbackSlider.hours.length <= 1) {
                return;
            }
            var timeSlider = me._control.find('.oskari-timeslider');
            var timeSliderPosition = timeSlider.position();
            var sliderHeight = timeSlider.height();

            var sliderWidth = timeSlider.width();
            timeSlider.find('.interval-line').remove();
            var pixelsPerTimeSerie = sliderWidth / (me._playbackSlider.times.length-1);

            var top = timeSliderPosition.top + 10;
            var sliderLeft = timeSliderPosition.left;
            var pixelsPerHourSerie = sliderWidth / me._playbackSlider.hours.length;

            var labelPadding = 5;

            for(var i=0;i<me._playbackSlider.hours.length;i++) {
                var currentHour = me._playbackSlider.hours[i];
                if(currentHour.value === '00:00') {
                    continue;
                }
                var intervals = currentHour.intervals;
                var left = (intervals * pixelsPerTimeSerie + sliderLeft);
                var intervalLine = me.template.intervalLine.clone();
                var label = intervalLine.find('.label');
                label.html(currentHour.value);
                if(i>0) {
                    label.addClass('center');
                }
                intervalLine.css('left', left + 'px' );
                timeSlider.append(intervalLine);
                var topPosition = top + sliderHeight - intervalLine.height();
                intervalLine.css('top', topPosition + 'px');

                if(label.width() + labelPadding > pixelsPerHourSerie) {
                    label.remove();
                }
            }
        },
        /**
         * @method  @private _moveSlider move slider
         * @param  {Object} e jQuery event
         */
        _moveSlider: function(e){
            var me = this;
            var timeSlider = me._control.find('.oskari-timeslider');
            var sliderWidth = timeSlider.width();
            var position = me._getXY(e,timeSlider[0]);
            var timeSeriesPopup = me._control.filter('.mapplugin-timeseries-popup');
            var pixelsPerTimeSerie = sliderWidth / (me._playbackSlider.times.length-1);
            var index = parseInt(position.x/pixelsPerTimeSerie);
            if(!isNaN(index) && index >= 0 && index < me._playbackSlider.times.length) {
                timeSeriesPopup.attr(me._TIMESERIES_INDEX, index);
                me._calculatePopupPosition();
            }
        },
        /**
         * @method  @public handleMapSizeChanged handle map size changed
         */
        handleMapSizeChanged: function(){
            var me = this;
            clearTimeout(me._timers.popupPosition);
            me._timers.popupPosition = setTimeout(function(){
                me._calculatePopupPosition();
            }, 50);
            me._addDayLines();
            me._addInternalLines();
        },
        /**
         * @method  @private _getXY get xy pixels from clicked element
         * @param  {Object} evt event
         * @param  {Object} element clicked element
         * @return {Object} {x:1,y:2}
         */
        _getXY: function(evt, element) {
            var rect = element.getBoundingClientRect();
            var scrollTop = document.documentElement.scrollTop?
                            document.documentElement.scrollTop:document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft?
                            document.documentElement.scrollLeft:document.body.scrollLeft;
            var elementLeft = rect.left+scrollLeft;
            var elementTop = rect.top+scrollTop;

            x = evt.pageX-elementLeft;
            y = evt.pageY-elementTop;

            return {x:x, y:y};
        }
});