altriaMap.controller('EmailGraphController', [
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

		var emailGraph = this,
			_pointLeft;

    this.unregister = [];
    this.noteContentType = "Promotion";
    this.emailGraphFilters = ["test"];
    this.mobileemailGraphFilters = ["mobile"];
    this.primaryGraphFilter = "";
    this.secondaryGraphFilter = "";
    this.currentExpandedNoteCount = 0;

    emailGraph.unregister.push($scope.$on('DataService:selectedPromo:update', function () {
      emailGraph.updateGraph();
    }));

    $scope.$on('$destroy', function(){

      var deleteFunction;

      while(emailGraph.unregister.length > 0) {
        deleteFunction = emailGraph.unregister.pop();
        deleteFunction();
      }
    });

		this.updateGraph = function () {

			if(FilterService.getPromoSelectType() === 'single-promo'){

				if (FilterService.getSelectedPromo().length) {
					RequestService.
					data("promotion-trend").
					then(function GCdateResolutionPromise(info) {

            var filtersArr = FilterService.displayemailGraphFilters();
            //removes date and total from array.
            filtersArr = $.map(filtersArr, function(value, index) {
              return [value];
            });

						//removes date and total from array.
						_.pull(filtersArr, 'Date', 'Total', 'date', 'total');

						emailGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
						emailGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
						emailGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
						emailGraph.currentDates = info.data.Date;

						//GraphService.setElement($('#promoHighChart'));
						info.data.openExpandedNotes = emailGraph.openExpandedNotes;
						info.data.moveIndicatorArrow = emailGraph.moveIndicatorArrow;
						GraphService.setData(info, "promoHighChart");
            emailGraph.emailGraphFilters = emailGraph.mobileemailGraphFilters = filtersArr;

					});
				}

			} else if(FilterService.getPromoSelectType() === 'multi-promo'){

				if (FilterService.getPromoMultiSelect().length && $scope.comparePromos.selectedPromoList.length) {
					RequestService.
						data("compareMultiplePromos").
						then(function GCdateResolutionPromise(info) {

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

							var filtersArr = FilterService.displayemailGraphFilters();
							//removes date and total from array.
              filtersArr = $.map(filtersArr, function(value, index) {
                return [value];
              });

              _.pull(filtersArr, 'Date', 'Total', 'date', 'total');

							emailGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
							emailGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
							emailGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
							emailGraph.currentDates = info.data.Date;

							//GraphService.setElement($('#promoHighChart'));
              GraphService.setElement($('.promoHighChart'));
							info.data.openExpandedNotes = emailGraph.openExpandedNotes;

							info.data.moveIndicatorArrow = emailGraph.moveIndicatorArrow;
							GraphService.setData(info, "promoHighChart", $('.promoHighChart') );
							FilterService.setChartData(info.data);
							emailGraph.chartData = FilterService.displayChartData();
              emailGraph.emailGraphFilters = emailGraph.mobileemailGraphFilters = filtersArr;
						});
				}

			}
		}

		function getNotes(dontUpdate) {
			return RequestService.
			data('promotion-expanded-notes').
			then(function GCnotePromise(info) {
          if(!dontUpdate) emailGraph.expandedNotes = info.data.docs;
          emailGraph.currentExpandedNoteCount = info.data.docs.length;
			});
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

			emailGraph.pointPosition = _left + padding + labelAWidth;
			_$('.indicator-arrow').css({
				left: emailGraph.pointPosition
			});

		};

		this.setDateResolution = function GCsetDateResolution(option) {
			assureString(option);
			FilterService.setPromoDateSort(option);
			emailGraph.updateGraph();
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
        timestamp = new Date(emailGraph.currentDates[ dontShow ? pointData.point.point.index : pointData.point.x]).getTime();
      } else {
        timestamp = "all";//dontShow ? pointData.point.x : pointData.point.category;
      }

      FilterService.setExpandedPromoTimePeriod(timestamp);

      getNotes(dontShow)
        .then(function(info){

          if(!dontShow) {
            FilterService.setShowPromoExpandedNotes(true);
            emailGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
            $timeout( function(){
              var note_pos= angular.element('.expanded-notes').prop('offsetTop');
              window.scrollTo(0,note_pos+200); }, 300);
          }
          deferred.resolve(emailGraph.currentExpandedNoteCount);
        })

      return deferred.promise;
		};

		this.closeExpandedNotes = function GCcloseExpandedNotes() {
			FilterService.setShowPromoExpandedNotes(false);
			emailGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
		};


		(function initialize() {

			/*if (FilterService.getSelectedPromo().length) {
			 RequestService.
			 data("promotion-trend").
			 then(function GCinit(info) {
			 var filtersArr = FilterService.displayemailGraphFilters();
			 //removes date and total from array.
			 _.pull(filtersArr, 'Date', 'Total', 'date', 'total');
			 emailGraph.emailGraphFilters = filtersArr;
			 emailGraph.showExpandedNotes = FilterService.getShowPromoExpandedNotes();
			 emailGraph.primaryGraphFilter = FilterService.displayPromoPrimaryGraphFilter();
			 emailGraph.secondaryGraphFilter = FilterService.displayPromoSecondaryGraphFilter();
			 emailGraph.currentDates = info.data.Date;
			 });
			 }*/

      FilterService.setPromoTimePeriod("all");
      FilterService.setShowPromoExpandedNotes(false);

			emailGraph.updateGraph();

		})();

		emailGraph.setDateResolution(FilterService.getPromoDateSort() || 'week');
		GraphService.setScope(emailGraph);

		$scope.GraphController = this;
		return $scope.GraphController;

	}]);
