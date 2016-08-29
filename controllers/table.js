altriaMap.controller('TableController', [
    '$scope'
  , '$rootScope'
  , '$filter'
  , 'FilterService'
  , 'Utility'
  , 'FORMATS'
  ,
		function ($scope, $rootScope, $filter, FilterService, Utility, FORMATS) {
		var table = this;
		var unregister;

		this.sortBy = "Date";
		this.sortAscending = [];
		this.sortAscending["Date"] = false;

		this.FORMATS = FORMATS;

		function constructObj(key, title, data) {
			return {
				title: title,
				data: data,
				getter: key
			};
		}

		function setColumnOrder(_dataObj) {
			_dataObj.order = 'ascending';
			var dataOrder = [
            'date'
          , 'comments-submitted'
          , 'comments-approved'
          , 'comment-approval-rate'
          , 'average-word-count'
          , 'photos-submitted'
          , 'photos-approved'
          , 'photo-approval-rate'
          , 'likes'
        ];
			table.column = [];
			table.columnData = [];
			table.columnTitles = [];
			table.totals = [];
			table.rowData = [];

			_.each(dataOrder, function (i, a) {

				if (typeof (_dataObj[i]) != 'undefined') {
					table.columnTitles.push(_dataObj[i]['title']);
					table.columnData[a] = _dataObj[i]['data'];
					table.column.push(_dataObj[i]);
				}

				if (typeof (table.columnData[a]) != 'undefined') {

					table.columnData[a].order = 'descending';

					var total = 0;
					_.each(table.columnData[a], function (n) {
						total += n;
					});

					if (dataOrder[a] == 'average-word-count' || dataOrder[a] == 'comment-approval-rate' || dataOrder[a] == 'photo-approval-rate') {
						// average values
						total = total / table.columnData[a].length;
					}

					total = round(total, 2);
					if (a == 0) {
						table.totals.push('Program Total');
					} else {
						table.totals.push(total);
					}
				}
			});


			// loop through the date column and fill rowData with blanks - this is just so the ng-repeat knows how many rows to render
			if (typeof (_dataObj['date']) != 'undefined') {
				for (var n = 0; n < _dataObj['date']['data'].length; n++) {
					table.rowData.push('');
				}
			}
		}

		function round(value, decimals) {
			return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
		}

		function updateTable() {

      //$scope.report.updateGraph()

			var _dataObj = {};
      var _dataObjMobile = {};
			// convenience
			var multiple = FilterService.getCommunitySelectType() === 'multi-community' ? true : false;

			// for multiple communities, the returned object is structured differently, so we have to parse it here and pretend the community names are in "date"
			if (multiple) {
				_dataObj['date'] = {};
				_dataObj['date']['data'] = [];
        _dataObjMobile['promos'] = [];   console.log(FilterService.displayChartData());

				_.each(FilterService.displayChartData()['Community'], function (data, title) {
					_dataObj['date']['data'].push(title);
          _dataObjMobile['promos'].push(title);
				});
			} else {
				table.mobileTableData = FilterService.getChartData();
			}
			// converts each column into an object with:
			// title (to be displayed),
			// data ( stuff in table cells)
			// and getter data (to get from filterOptions)
			//
			_.each(FilterService.displayGraphFilters(), function (key, index) {
				var _key = FilterService.getGraphFilters(true)[index],
					_title = FilterService.displayGraphFilters()[index],
					_data = multiple ? FilterService.displayChartData()['Community'][_title] : FilterService.displayChartData()[_title];

				_dataObj[_key] = constructObj(_key, _title, _data);

				if (multiple) {
					// if it's multi-community, we have to loop through 'Communities' and push all their values into this column's data
					_dataObj[_key].data = [];
          var _mkey = table.formatmultimobilekeys(_key);
          _dataObjMobile[_mkey] = [];
					_.each(FilterService.displayChartData()['Community'], function (cData, cTitle) {
						_dataObj[_key].data.push(cData[_title]);
            _dataObjMobile[_mkey].push(cData[_title]);
					});

				} else {
					if (_key === 'date') {
						_dataObj['date'].data = _.map(_dataObj['date'].data, function (date) {
							var d = date;
							return $filter('date')(d, 'MM/dd/yyyy', 'UTC');
						});
					}
				}

				// table[_key] = _dataObj[_key].data;
			});
			// console.log('FilterService.getChartData() ' + JSON.stringify(FilterService.getChartData()));
      if (multiple) {

        _dataObjMobile['Total'] = FilterService.displayChartData()['Total'];
        table.mobileTableData = _dataObjMobile;
        table.multi = true;
      }
			setColumnOrder(_dataObj);
		}

		function initialize() {

      table.setDateResolution(FilterService.getDateSort());
			//updateTable();

			$scope.report.reportFuncCtrl.download = function(elem){

				var tableElem,
					infoObj;

				if($('table.desktop').is(':visible')){

					tableElem = $('table.desktop');

				} else {

					tableElem = $('table.mobile');

				}

				infoObj = {
					filename: 'UGC - '+ table.getTableTitle() + ' - '+ table.getTableTimePeriod().replace(',',' to ') +'.csv',
					title: table.getTableTitle(),
					subtitle: table.getTableTimePeriod(),
					reportSuite: 'Community',
          brand: $filter('deslug')($rootScope.$stateParams.brand)
				};

				Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
			}
		};

		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:chartData:update', function () {
			updateTable();
		});

		$scope.$on('$destroy', unregister);

		this.getTableTitle = function(){

			if(FilterService.getCommunitySelectType() !== 'single-community'){

				return $filter('deslug')(FilterService.displayMultiCommunitySelect());

			} else {

				return $filter('deslug')(FilterService.displaySingleCommunitySelect());

			}
		};

		this.getTableTimePeriod = function(){

			var copy = "";

			if(FilterService.getTimePeriodType() === "time-period"){

				copy += FilterService.displayTimePeriod().label.toUpperCase() + " by " + FilterService.displayDateSort().toUpperCase()

			} else {

				copy += $filter('date')(FilterService.displayTimePeriod()[0], "MM/dd/yyyy" , 'UTC') +
						" - " +
						$filter('date')(FilterService.displayTimePeriod()[1], "MM/dd/yyyy" , 'UTC') +
						" by " +
						FilterService.displayDateSort().toUpperCase()

			}

			return copy;

		};

		this.getFormat = function(key, value){

			if(value === null || value === '' || value === undefined ){
				return FORMATS.NA;
			} else if(key == 'Date'){
				return FORMATS.DATE;
			} else if (key && (key.indexOf('%') > -1 || key.toLowerCase().indexOf('rate') > -1)){
				return FORMATS.PERCENT;
			} else if(!isNaN(value)) {
				return FORMATS.NUMBER;
			} else {
				return FORMATS.TEXT;
			}

		};

		this.predicate = function(val){

			return val[table.sortBy];
		};

		this.sortHandler = function(sortOn, evt){

			table.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				table.sortAscending[sortOn]=!table.sortAscending[sortOn];
			} else {
				table.sortAscending[sortOn]=true;
			}
		};

    this.setDateResolution = function GCsetDateResolution(option) {
      assureString(option);
      FilterService.setDateSort(option);
      $scope.report.updateGraph();
    };

    this.isSelectedDateSort = function GCisSelectedDateSort(option) {
      return option === FilterService.getDateSort();
    };

      this.formatmultimobilekeys = function (key){
        var str = key.replace(/-/g, ' ');
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      };

    function assureString(option) {
      if (!angular.isString(option)) {
        throw new Error('not a string');
      }
    }

		initialize();

		$scope.TableController = this;
		return $scope.TableController;
  }]);
