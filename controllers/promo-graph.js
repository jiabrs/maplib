altriaMap.controller('PromoGraphController', [
	'$scope'
	, '$rootScope'
	, 'FilterService'
	, 'GraphService'
	, 'RequestService'
  , '$q'
	, '$anchorScroll'
  , '$location'
  , '$timeout'
  ,
		function (
		$scope, $rootScope, FilterService, GraphService, RequestService, $q, $anchorScroll, $location, $timeout) {

		var promoGraph = this,
			_pointLeft;

    this.unregister = [];
    this.noteContentType = "Promotion";
    this.promoGraphFilters = ["test"];
    this.mobilePromoGraphFilters = ["mobile"];
    this.primaryGraphFilter = "";
    this.secondaryGraphFilter = "";
    this.currentExpandedNoteCount = 0;

    promoGraph.unregister.push($scope.$on('DataService:selectedPromo:update', function () {
      promoGraph.updateGraph();
    }));

    $scope.$on('$destroy', function(){

      var deleteFunction;

      while(promoGraph.unregister.length > 0) {
        deleteFunction = promoGraph.unregister.pop();
        deleteFunction();
      }
    });

		this.updateGraph = function () {

			if(FilterService.getPromoSelectType() === 'single-promo'){

				if (FilterService.getSelectedPromo().length) {

          var promise = RequestService.data("promotion-trend");
          if (promise){

            promise.then(function GCdateResolutionPromise(info) {

            var filtersArr = FilterService.displayPromoGraphFilters();
            //removes date and total from array.
            filtersArr = $.map(filtersArr, function(value, index) {
              return [value];
            });

						//removes date and total from array.
						_.pull(filtersArr, 'Date', 'Total', 'date', 'total');

						promoGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
						promoGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
						promoGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
						promoGraph.currentDates = info.data.Date;

						//GraphService.setElement($('#promoHighChart'));
						info.data.openExpandedNotes = promoGraph.openExpandedNotes;
						info.data.moveIndicatorArrow = promoGraph.moveIndicatorArrow;
						GraphService.setData(info, "promoHighChart");
            promoGraph.promoGraphFilters = promoGraph.mobilePromoGraphFilters = filtersArr;

					  }, function(){});
					}
				}

			} else if(FilterService.getPromoSelectType() === 'multi-promo'){

				if (FilterService.getPromoMultiSelect().length && $scope.comparePromos.selectedPromoList.length) {
				  promise = RequestService.data("compareMultiplePromos");
          if(promise){
						promise.then(function GCdateResolutionPromise(info) {

							// for multiple communities, the returned object is structured differently, so we have to parse it here and pretend the community names are in "date"

							$scope.comparePromos.tableData = [];
							_.each(info.data['Promotion'], function (data, title) {
								//_dataObj['date']['data'].push(title);
								//console.log("creating multiple table object")
								data['Date'] = title;
								$scope.comparePromos.tableData.push(data);
							});
							$scope.comparePromos.tableData['Total'] = info.data.Total;


							//report.tableData = formatTableData(info.data);
							//debug('RCsetComData', info);

							var filtersArr = FilterService.displayPromoGraphFilters();
							//removes date and total from array.
              filtersArr = $.map(filtersArr, function(value, index) {
                return [value];
              });

              _.pull(filtersArr, 'Date', 'Total', 'date', 'total');

							promoGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
							promoGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
							promoGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
							promoGraph.currentDates = info.data.Date;

							//GraphService.setElement($('#promoHighChart'));
              GraphService.setElement($('.promoHighChart'));
							info.data.openExpandedNotes = promoGraph.openExpandedNotes;

							info.data.moveIndicatorArrow = promoGraph.moveIndicatorArrow;
							GraphService.setData(info, "promoHighChart", $('.promoHighChart') );
							FilterService.setChartData(info.data);
							promoGraph.chartData = FilterService.displayChartData();
              promoGraph.promoGraphFilters = promoGraph.mobilePromoGraphFilters = filtersArr;
						},function(){}); }
				}

			}
		}

		function getNotes(dontUpdate) {

		  var promise = RequestService.data('promotion-expanded-notes');
      if(promise) {
         return promise. then(function GCnotePromise(info) {
            if (!dontUpdate) promoGraph.expandedNotes = info.data.docs;
            promoGraph.currentExpandedNoteCount = info.data.docs.length;
          }, function(){});
      }
		}

		function updateFilter() {
			GraphService.setData(null, "promoHighChart");
		}

		function assureString(option) {
			if (!angular.isString(option)) {
				throw new Error('not a string');
			}
		}

		this.moveIndicatorArrow = function GCmoveIndicatorArrow(e) {
			var _$ = jQuery,
				notesWidth = _$('.expanded-notes').width(),
				labelAWidth = _$('g.highcharts-yaxis-labels').
			eq(0)[0].
			getBBox().
			width, padding = _$('.chart-container').
			cssUnit('padding-left')[0], _left;

			if (e) {
				_pointLeft = e.currentTarget;
			}
			if (typeof _pointLeft === 'undefined') {
				return;
			}

			_left = _pointLeft.plotX + 10;

			promoGraph.pointPosition = _left + padding + labelAWidth;
			_$('.indicator-arrow').css({
				left: promoGraph.pointPosition
			});

		};

		this.setDateResolution = function GCsetDateResolution(option) {
			assureString(option);
			FilterService.setPromoDateSort(option);
			promoGraph.updateGraph();
		};

		this.isSelectedDateSort = function GCisSelectedDateSort(option) {
			return option === FilterService.getPromoDateSort();
		};

		this.setPrimaryFilter = function GCsetPrimaryFilter(filter) {
			assureString(filter);
			FilterService.setPromoPrimaryGraphFilter(filter);
			updateFilter();
		};

		this.setSecondaryFilter = function GCsetSecondaryFilter(filter) {
			assureString(filter);
			FilterService.setPromoSecondaryGraphFilter(filter);
			updateFilter();
		};

		this.openExpandedNotes = function GCopenExpandedNotes(pointData, dontShow) {

      var deferred = $q.defer(),
          timestamp;

      if(FilterService.getPromoSelectType() === 'single-promo'){
        timestamp = new Date(promoGraph.currentDates[ (dontShow && pointData.point.hasOwnProperty('point')) ? pointData.point.point.index : pointData.point.x]).getTime();
      } else {
        timestamp = "all";//dontShow ? pointData.point.x : pointData.point.category;
      }

      FilterService.setExpandedPromoTimePeriod(timestamp);
      var notes = getNotes(dontShow);
      if(notes){
       notes.then(function(info){
          if(!dontShow) {
            FilterService.setShowPromoExpandedNotes(true);
            promoGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
            $timeout( function(){
              var note_pos= angular.element('.expanded-notes').prop('offsetTop');
              window.scrollTo(0,note_pos+200); }, 300);
          }
          deferred.resolve(promoGraph.currentExpandedNoteCount);
       })}

      return deferred.promise;
		};

		this.closeExpandedNotes = function GCcloseExpandedNotes() {
			FilterService.setShowPromoExpandedNotes(false);
			promoGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
		};


		(function initialize() {

			/*if (FilterService.getSelectedPromo().length) {
			 RequestService.
			 data("promotion-trend").
			 then(function GCinit(info) {
			 var filtersArr = FilterService.displayPromoGraphFilters();
			 //removes date and total from array.
			 _.pull(filtersArr, 'Date', 'Total', 'date', 'total');
			 promoGraph.promoGraphFilters = filtersArr;
			 promoGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
			 promoGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
			 promoGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
			 promoGraph.currentDates = info.data.Date;
			 });
			 }*/

      FilterService.setPromoTimePeriod("all");
      FilterService.setShowPromoExpandedNotes(false);

			promoGraph.updateGraph();

		})();

		promoGraph.setDateResolution(FilterService.getPromoDateSort() || 'week');
		GraphService.setScope(promoGraph);

		$scope.GraphController = this;
		return $scope.GraphController;

	}]);
