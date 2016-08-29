altriaMap.controller('EmailTableController', [
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
		var emailTable = this;
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

        RequestService.
          data("promotion-trend").
          then(function GCdateResolutionPromise(info) {
            emailTable.sortAscending["Date"] = true;

            GraphService.setElement($('.promoHighChart'));
            info.data.openExpandedNotes = emailTable.openExpandedNotes;
            info.data.moveIndicatorArrow = emailTable.moveIndicatorArrow;
            GraphService.setData(info, "promoHighChart");

            emailTable.tableData = formatTableData(info.data);
            emailTable.mobileTableData = info.data;

            delete emailTable.mobileTableData['keys'];
            delete emailTable.mobileTableData['openExpandedNotes'];
            delete emailTable.mobileTableData['moveIndicatorArrow'];

        });

      } else if(FilterService.getPromoSelectType() === 'multi-promo') {

        RequestService.
          data("compareMultiplePromos").
          then(function GCdateResolutionPromise(info) {
            emailTable.sortAscending["Promos"] = true;
            emailTable.tableData = [];
            _.each(info.data['Promotion'], function (data, title) {
              //_dataObj['date']['data'].push(title);
              //console.log("creating multiple table object")
              data['Promos'] = data['Date'] = title;
              emailTable.tableData.push(data);
            });

            //emailTable.tableData['Total'] = info.data.Total;
            GraphService.setElement($('.promoHighChart'));
            info.data.openExpandedNotes = emailTable.openExpandedNotes;
            info.data.moveIndicatorArrow = emailTable.moveIndicatorArrow;
            GraphService.setData(info, "promoHighChart");
            FilterService.setChartData(info.data);

            emailTable.mobileTableData = formatMobileTableData(emailTable.tableData);
            emailTable.tableData = formatTableData(emailTable.tableData);

            delete emailTable.mobileTableData['keys'];
            delete emailTable.mobileTableData['openExpandedNotes'];
            delete emailTable.mobileTableData['moveIndicatorArrow'];

          });


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
			emailTable.tableOrder = [];

      if(FilterService.getPromoSelectType() == "single-promo") {

        _.each(data, function(value, key){
          emailTable.tableOrder.push(key);
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
          emailTable.tableOrder = data.keys;

      } else if(FilterService.getPromoSelectType() == "multi-promo"){

        _.each(data, function(v,k){
          _.each(v, function (value, key) {

            if(!k) emailTable.tableOrder.push(key);

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
          emailTable.tableOrder = data[0].keys;
          emailTable.tableOrder.unshift("Promos");
        }
      }



			formattedData.Total = data.Total;
			return formattedData;
		}

    this.setDateResolution = function GCsetDateResolution(option) {
      assureString(option);
      FilterService.setPromoDateSort(option);
      emailTable.updateTable();
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

      emailTable.setDateResolution(FilterService.getPromoDateSort());

			emailTable.titles = {};
			emailTable.updateTable();

			if(FilterService.getPromoSelectType() === 'single-promo') {
				$scope.singlePromo.reportFuncCtrl.download = function (elem) {

					var tableElem,
						infoObj;

					if ($('.promotions table.desktop').is(':visible')) {

						tableElem = $('.promotions table.desktop.data-table');

					}

					infoObj = {
						filename: 'Promotions - ' + emailTable.getTableTitle().toUpperCase() + ' - ' + emailTable.getTableTimePeriod().replace(',', ' to ') + '.csv',
						title: emailTable.getTableTitle(),
						subtitle: emailTable.getTableTimePeriod(),
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
						title: "Compare",//emailTable.getTableTitle(),
						subtitle: "",//emailTable.getTableTimePeriod(),
						reportSuite: 'Promotion',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
					}

					Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
				}
			}

		})();
		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:selectedPromo:update', function () {
			emailTable.updateTable();
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

			return val[emailTable.sortBy];
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

			emailTable.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				emailTable.sortAscending[sortOn]=!emailTable.sortAscending[sortOn];
			} else {
				emailTable.sortAscending[sortOn]=true;
			}
		}

		$scope.TableController = this;
		return $scope.TableController;
	}]);
