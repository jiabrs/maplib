altriaMap.controller('GraphController', [
    '$scope', 'FilterService', 'GraphService', 'RequestService', '$rootScope', '$q', '$timeout', 'ngDialog',
		function (
		$scope, FilterService, GraphService, RequestService, $rootScope, $q, $timeout, ngDialog) {
		var graph = this,
			_pointLeft;

    this.currentExpandedNoteCount = 0;

		function updateGraph() {

      var type = (FilterService.displayCommunitySelectType() === 'multi-community') ? 'compareMultipleCommunities' : '';

      if (type === 'compareMultipleCommunities' && FilterService.getMultiCommunitySelect() === "") {
        var errorMsg = 'Please select communities';

        if (!$rootScope.errorDialog) {
          $rootScope.errorDialog = true;
          ngDialog.open({
            template: '' +
            '<h2 class="ng-dialog-error-message ng-dialog-error">Please select communities to compare.</h2>',
            plain: true
          });
        }

        return;
      }

      var promise = RequestService.data(type);
      if (promise)
        {
         promise.then(function GCdateResolutionPromise(info) {

            FilterService.setChartData(info.data);
            //FilterService.setGraphFilters(_.keys(info));

            $scope.report.currentDates = info.data.Date;
            GraphService.setData(info, type);

            var filtersArr = type === "compareMultipleCommunities" ? _.keys(info.data.Total) : _.keys(info.data);//FilterService.displayGraphFilters();
            _.pull(filtersArr, 'Date', 'Total', 'date', 'total');

            info.data.openExpandedNotes = graph.openExpandedNotes;
            info.data.moveIndicatorArrow = graph.moveIndicatorArrow;

            graph.graphFilters = filtersArr;
            graph.showExpandedNotes = FilterService.getShowExpandedNotes();
            graph.primaryGraphFilter = FilterService.displayPrimaryGraphFilter();
            graph.secondaryGraphFilter = FilterService.displaySecondaryGraphFilter();

            FilterService.setShowExpandedNotes(false);

          },
          function(){});
      }
    }
		function getNotes(dontUpdate) {
			return RequestService.
			data('expanded-notes').
			then(function GCnotePromise(info) {
          if(!dontUpdate) graph.expandedNotes = info.data.docs;
          graph.currentExpandedNoteCount = info.data.docs.length;
			});
		}

		function updateFilter() {
			var type = (FilterService.displayCommunitySelectType() === 'multi-community') ? 'compareMultipleCommunities' : '';
			GraphService.setData(null, type);
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

			graph.pointPosition = _left + padding + labelAWidth;
			_$('.indicator-arrow').css({
				left: graph.pointPosition
			});

		};

		this.setDateResolution = function GCsetDateResolution(option) {
			assureString(option);
			FilterService.setDateSort(option);
			updateGraph();
		};

		this.isSelectedDateSort = function GCisSelectedDateSort(option) {
			return option === FilterService.getDateSort();
		};

		this.setPrimaryFilter = function GCsetPrimaryFilter(filter) {
			assureString(filter);
			FilterService.setPrimaryGraphFilter(filter);
			updateFilter();
		};

		this.setSecondaryFilter = function GCsetSecondaryFilter(filter) {
			assureString(filter);
			FilterService.setSecondaryGraphFilter(filter);
			updateFilter();
		};

		this.openExpandedNotes = function GCopenExpandedNotes(pointData, dontShow) {

      var deferred = $q.defer(),
          timestamp;

      //alert("test");
      if(FilterService.displayCommunitySelectType() === 'multi-community'){
        timestamp = dontShow ? pointData.point.x : pointData.point.category;
      }else{
        timestamp = dontShow ? FilterService.getChartData().Date[pointData.point.x] : FilterService.getChartData().Date[pointData.point.category];
      }

      FilterService.setExpandedTimePeriod(timestamp);

			getNotes(dontShow)
        .then(function(info){
          if(!dontShow){
            FilterService.setShowExpandedNotes(true);
            graph.showExpandedNotes = FilterService.getShowExpandedNotes();

            $timeout( function(){
              var note_pos= angular.element('.expanded-notes').prop('offsetTop');
              window.scrollTo(0,note_pos+200);
            }, 300);
          }


          deferred.resolve(graph.currentExpandedNoteCount);


        });

      return deferred.promise;

		};

		this.closeExpandedNotes = function GCcloseExpandedNotes() {
			FilterService.setShowExpandedNotes(false);
			graph.showExpandedNotes = FilterService.getShowExpandedNotes();
		};

    (function initialize() {

      //graph.setDateResolution(FilterService.getDateSort());

     // updateGraph();

    })();

    // listens for a setter to be called on FilterService.
    unregister = $rootScope.$on('DataService:update', function () {
      updateGraph();
    });

    $scope.$on('$destroy', unregister);

    graph.setDateResolution(FilterService.getDateSort() || 'month');
		GraphService.setScope(graph);

		$scope.GraphController = this;
		return $scope.GraphController;
  }]);
