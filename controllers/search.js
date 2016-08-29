altriaMap.controller('SearchController', [
      '$scope'
    , '$rootScope'
    , '$window'
    , '$sce'
    , '$filter'
    , 'ngDialog'
    , 'FilterService'
    , 'RequestService'
    , 'Utility'
    , 'TIME_PERIOD_OPTIONS'
    ,
		function (
		$scope, $rootScope, $window, $sce, $filter, ngDialog, FilterService, RequestService, Utility, TIME_PERIOD_OPTIONS) {

		var search = this;

		search.total = 0;
		search.currentPage = 1;
		search.pagingBusy = false;
		search.filtersOpen = false;

		var _debug = false;

		this.sortBy = "date";
		this.sortAscending = [];
		this.sortAscending["date"] = false;
		this.reportFuncCtrl = {};

		function debug(from, thing) {
			if (_debug === true) {
				//console.log(from);
				//console.log(thing);
			}
		}

		this.initialize = function() {
			$rootScope.layoutClass = "search";

			RequestService.
			data('listCommunities').
			then(function SClistCom(info) {
				search.communities = info.data;
				search.communities.unshift('all');
				search.setSingleCommunitySelect('all');
				search.singleCommunitySelect = info.data[0];
				debug('SClistCom', info.data);
			});

			/*RequestService.
			data('search-terms').
			then(function (info) {
				search.trendingTerms = info.data;
			});

			//search.submitSearch();*/

			search.communitySelectType = FilterService.getCommunitySelectType();
			search.filterOptions = FilterService.filterOptions();

			search.multiCommunitySelectOpen = FilterService.getMultiCommunitySelectOpen();

			search.timePeriod = TIME_PERIOD_OPTIONS[1];
			search.timePeriodType = FilterService.getTimePeriodType();


			search.dateOptionsStart = {
				minDate: '-5y',
				maxDate: function () {
					return (search.dateEnd) ? search.dateEnd : 0;
				}()

			};
			search.dateOptionsEnd = {
				minDate: function () {
					return (search.dateStart) ? search.dateStart : '-5y';
				}(),
				maxDate: '0'

			};

			search.timePeriodOptions = TIME_PERIOD_OPTIONS;

		};

		this.retrieveTerms = function(){
			RequestService.
			data('search-terms').
			then(function (info) {
				search.trendingTerms = info.data;
			});
		}

		this.onTermClick = function (term) {
			var input = $("input#search");
			input.val(term);
			input.trigger('input');
			search.submitSearch();
		}

		this.submitSearch = function () {

			search.currentPage = 1;
			search.pagingBusy = false;

			var dataObj = {
				query: search.searchTerm || "all"
			};

			RequestService.data("search", dataObj)
				.then(function (info) {
					var tempResults = info.data.docs;

					for (var i = 0; i < tempResults.length; i++) {
						tempResults[i].text = $sce.trustAsHtml(tempResults[i].text);
					}

					search.results = tempResults;
					search.total = info.data.total;

				});
		}

		this.setSingleCommunitySelect = function(val){
			FilterService.setSearchSingleCommunitySelect(val);
			search.singleCommunitySelect = FilterService.displaySearchSingleCommunitySelect();
			search.retrieveTerms();
			search.submitSearch();
		}

		this.updateTimePeriodType = function(val){
			FilterService.setSearchTimePeriodType(val);
			search.retrieveTerms();
			search.submitSearch();
		}

		this.updateTimePeriod = function(val){
			FilterService.setSearchTimePeriod(val);
			search.retrieveTerms();
			search.submitSearch();
		}

		this.setDateRange = function(val){
			var str;

			/*
				TODO: this is a hack because the model was not updating immediately on blur. updateOn:blur on the inputs didn't work. A tiny delay makes it work.
				*/
			setTimeout(function () {
				if (search.dateStart && search.dateEnd) {
					if (search.dateStart > search.dateEnd) {
						//should we really be using a plugin for this?
            if (!$rootScope.errorDialog) {
              $rootScope.errorDialog = true;
              ngDialog.open({
                template: '<h2 class="ng-dialog-error-message ng-dialog-error">Please select a start date that occurs prior to the end date.</h2>',
                plain: true
              });
            }
						search.dateStart = null;
						search.dateEnd = null;
						return;
					}else if(search.dateStart === search.dateEnd){
						//console.log("same date");
						var tempDate = new Date(parseInt(search.dateStart))

						search.dateStart = Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate()).toString();

						var oldDate = new Date(parseInt(search.dateEnd));
						var newDate = new Date(Date.UTC(oldDate.getUTCFullYear(), oldDate.getUTCMonth(), oldDate.getUTCDate()));

						newDate.setUTCDate(newDate.getUTCDate()+1);

						search.dateEnd = String(newDate.getTime() - 1)

					}
					str = Utility.transformStringToParameter([search.dateStart, search.dateEnd]);
					//console.log('setDateRange str ' + str);
					FilterService.setSearchTimePeriod({value:str});
					search.retrieveTerms();
					search.submitSearch();
				}
			}, 200);


		}

		this.paging = function(){

			if(!search.pagingBusy){
				var dataObj = {
					query: search.searchTerm,
					pageNum: ++search.currentPage,
					amtPerPage: 25
				};

			search.pagingBusy = true;

			RequestService.data("search-paging", dataObj)
				.then(function (info) {

					var tempResults = info.data.docs;

					for (var i = 0; i < tempResults.length; i++) {
						tempResults[i].text = $sce.trustAsHtml(tempResults[i].text);
					}

					search.results = search.results.concat(tempResults);

					if(tempResults.length){
						search.pagingBusy = false;
					}

				});
			}
		}

		this.getTableTitle = function(){

			return $filter('deslug')(FilterService.displaySearchSingleCommunitySelect());

		}

		this.getTableTimePeriod = function(){

			var copy = "";

			if(FilterService.getTimePeriodType() === "time-period"){

				copy += FilterService.displaySearchTimePeriod().toUpperCase();

			} else {

				copy += $filter('date')(FilterService.displaySearchTimePeriod()[0], "MM/dd/yyyy" , 'UTC') +
						" - " +
						$filter('date')(FilterService.displaySearchTimePeriod()[1], "MM/dd/yyyy" , 'UTC');

			}

			return copy;

		}

		this.sortHandler = function(sortOn, evt){

			search.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				search.sortAscending[sortOn]=!search.sortAscending[sortOn];
			} else {
				search.sortAscending[sortOn]=true;
			}
		}

		this.reportFuncCtrl.download = function(elem){

			var tableElem,
				infoObj;

			tableElem = $('.desktop table');

			infoObj = {
				filename: 'UGC_'+ search.getTableTitle().toUpperCase() + '_'+ search.getTableTimePeriod().toUpperCase() +'_Comments('+ search.searchTerm +').csv',
				title: search.getTableTitle(),
				subtitle: search.getTableTimePeriod(),
				reportSuite: 'Community',
        brand: $filter('deslug')($rootScope.$stateParams.brand)
			}

			Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
		}

		this.initialize();

		$scope.SearchController = this;
		return $scope.SearchController;
  }]);
