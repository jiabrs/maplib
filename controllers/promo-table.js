altriaMap.controller('PromoTableController', [
	'$scope'
	, '$rootScope'
	, '$filter'
	, 'FilterService'
	, 'RequestService'
  	, 'GraphService'
  	, 'Utility'
  	, 'FORMATS'
	,
		function ($scope, $rootScope, $filter, FilterService, RequestService, GraphService, Utility, FORMATS) {
		var promoTable = this;
		var unregister;

		this.sortBy = "Date";
		this.sortAscending = [];

		this.tableOrder = [];
		this.tableData = {};
		this.mobileTableData = {};

		this.FORMATS = FORMATS;

		function constructObj(key, title, data) {
			return {
				title: title,
				data: data,
				getter: key
			};
		}

		function round(value, decimals) {
			return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
		}

		this.updateTable = function () {

      if(FilterService.getPromoSelectType() === 'single-promo') {
        var promise = RequestService.data("promotion-trend");
        if(promise){
          promise.then(function GCdateResolutionPromise(info) {
            promoTable.sortAscending["Date"] = true;

            GraphService.setElement($('.promoHighChart'));
            info.data.openExpandedNotes = promoTable.openExpandedNotes;
            info.data.moveIndicatorArrow = promoTable.moveIndicatorArrow;
            GraphService.setData(info, "promoHighChart");

            promoTable.tableData = formatTableData(info.data);
            promoTable.mobileTableData = info.data;

            delete promoTable.mobileTableData['keys'];
            delete promoTable.mobileTableData['openExpandedNotes'];
            delete promoTable.mobileTableData['moveIndicatorArrow'];

        }, function(){});}

      } else if(FilterService.getPromoSelectType() === 'multi-promo') {

        var promise =  RequestService.data("compareMultiplePromos");
        if(promise) {

          promise.then(function GCdateResolutionPromise(info) {
            promoTable.sortAscending["Promos"] = true;
            promoTable.tableData = [];
            _.each(info.data['Promotion'], function (data, title) {
              //_dataObj['date']['data'].push(title);
              //console.log("creating multiple table object")
              data['Promos'] = data['Date'] = title;
              promoTable.tableData.push(data);
            });

            //promoTable.tableData['Total'] = info.data.Total;
            GraphService.setElement($('.promoHighChart'));
            info.data.openExpandedNotes = promoTable.openExpandedNotes;
            info.data.moveIndicatorArrow = promoTable.moveIndicatorArrow;
            GraphService.setData(info, "promoHighChart");
            FilterService.setChartData(info.data);

            promoTable.mobileTableData = formatMobileTableData(promoTable.tableData);
            promoTable.tableData = formatTableData(promoTable.tableData);

            delete promoTable.mobileTableData['keys'];
            delete promoTable.mobileTableData['openExpandedNotes'];
            delete promoTable.mobileTableData['moveIndicatorArrow'];

          },function(){});

        }
      }

		}

    function formatMobileTableData(data){

      var formattedData = {};

      for(var i=0; i < data.length; i++){
        _.each(data[i], function(val, key){
          if(!formattedData[key]) formattedData[key] = [];
          formattedData[key][i] = val;
        })
      }

      return formattedData;
    }

		function formatTableData(data){
			var formattedData = [];
			promoTable.tableOrder = [];

      if(FilterService.getPromoSelectType() == "single-promo") {

        _.each(data, function(value, key){
          promoTable.tableOrder.push(key);
          if((key !== 'openExpandedNotes' || key !== 'moveIndicatorArrow' || key !== 'keys') &&
            value ){
            for(var i=0; i < value.length; i++){
              if(key !== 'keys'){
                if(!formattedData[i]) formattedData[i] = {};
                formattedData[i][key] = value[i];
              }
            }
          }
        });

        if(data.keys)
          promoTable.tableOrder = data.keys;

      } else if(FilterService.getPromoSelectType() == "multi-promo"){

        _.each(data, function(v,k){
          _.each(v, function (value, key) {

            if(!k) promoTable.tableOrder.push(key);

            if ((key !== 'openExpandedNotes' || key !== 'moveIndicatorArrow' || key !== 'keys') &&
              value) {
              //for (var i = 0; i < value.length; i++) {
                if (key !== 'keys') {
                  if (!formattedData[k]) formattedData[k] = {};
                  formattedData[k][key] = value;
                }
              //}
            }
          })
        });

        if(data.length && data[0].keys){
          promoTable.tableOrder = data[0].keys;
          promoTable.tableOrder.unshift("Promos");
        }
      }



			formattedData.Total = data.Total;
			return formattedData;
		}

    this.setDateResolution = function GCsetDateResolution(option) {
      assureString(option);
      FilterService.setPromoDateSort(option);
      promoTable.updateTable();
    };

    this.isSelectedDateSort = function GCisSelectedDateSort(option) {
      return option === FilterService.getPromoDateSort();
    };

    function assureString(option) {
      if (!angular.isString(option)) {
        throw new Error('not a string');
      }
    }

		(function initialize() {

      promoTable.setDateResolution(FilterService.getPromoDateSort());

			promoTable.titles = {};
			promoTable.updateTable();

			if(FilterService.getPromoSelectType() === 'single-promo') {
				$scope.singlePromo.reportFuncCtrl.download = function (elem) {

					var tableElem,
						infoObj;

					if ($('.promotions table.desktop').is(':visible')) {

						tableElem = $('.promotions table.desktop.data-table');

					}

					infoObj = {
						filename: 'Promotions - ' + promoTable.getTableTitle().toUpperCase() + ' - ' + promoTable.getTableTimePeriod().replace(',', ' to ') + '.csv',
						title: promoTable.getTableTitle(),
						subtitle: promoTable.getTableTimePeriod(),
						reportSuite: 'Promotion',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
					}

					Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
				}
			} else if(FilterService.getPromoSelectType() === 'multi-promo'){
				$scope.comparePromos.reportFuncCtrl.download = function (elem) {

					var tableElem,
						infoObj;

					if ($('.promotions table.desktop').is(':visible')) {

						tableElem = $('.promotions table.desktop.data-table');

					}

					infoObj = {
						filename: 'Promotions - ' + $filter('deslug')($rootScope.$stateParams.brand).toUpperCase() + ' - Compare.csv',
						title: "Compare",//promoTable.getTableTitle(),
						subtitle: "",//promoTable.getTableTimePeriod(),
						reportSuite: 'Promotion',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
					}

					Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
				}
			}

		})();
		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:selectedPromo:update', function () {
			promoTable.updateTable();
		});

    $scope.$on('$destroy', unregister);

		this.getFormat = function(key, value){

			if(value === null || value === '' || value === undefined){
				return FORMATS.NA;
			} else if(key == 'Date'){
				return FORMATS.DATE;
			} else if (key.indexOf('%') > -1 || key.toLowerCase().indexOf('rate') > -1){
				return FORMATS.PERCENT;
			} else if(!isNaN(value)) {
				return FORMATS.NUMBER;
			} else {
				return FORMATS.TEXT;
			}

		}

		$scope.$on('$destroy', unregister);

		this.predicate = function(val){

			return val[promoTable.sortBy];
		}

		this.getTableTitle = function(){

			return FilterService.displaySelectedPromo();

		}

		this.getTableTimePeriod = function(){

			var copy = "";

			copy += FilterService.displayPromoQtrTimePeriod() +
					" by " +
					FilterService.displayPromoDateSort().toUpperCase();

			return copy;

		}

		this.sortHandler = function(sortOn, evt){

			promoTable.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				promoTable.sortAscending[sortOn]=!promoTable.sortAscending[sortOn];
			} else {
				promoTable.sortAscending[sortOn]=true;
			}
		}

		$scope.TableController = this;
		return $scope.TableController;
	}]);
