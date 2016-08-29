altriaMap.controller('PromotionOverviewController', [
     '$scope'
    , '$rootScope'
    , '$http'
    , '$filter'
    , '$interval'
    , 'ngDialog'
    , 'RequestService'
    , 'FilterService'
    , 'GraphService'
    ,
		function (
		$scope, $rootScope, $http, $filter, $interval, ngDialog, RequestService, FilterService, GraphService
		/*, AddNote*/
		) {

		  var promoOverview = this;
      this.unregister = [];
      promoOverview.overviewData = {};
      promoOverview.mobileOverviewData = {};
      promoOverview.overviewTableData = {data:null, dateRange:null};
      promoOverview.slides = [0,1,2,3];

      this.loadPromotion = function () {

        if (FilterService.getSelectedPromo().length && $scope.singlePromo.promoList.length) {

          promoOverview.promoName = FilterService.getSelectedPromo();

          var dataObj = {
            promoName: promoOverview.promoName
          };

          RequestService
            .data('promotion-overview', dataObj)
            .then(function POCinit(info){

              promoOverview.overviewData = info.data;
              promoOverview.mobileOverviewData = info.data;

              promoOverview.overviewTableData = {
                data: promoOverview.overviewData['Totals'],
                dateRange: {
                  start: $filter('date')(promoOverview.overviewData.Start),
                  end: $filter('date')(promoOverview.overviewData.End)
                }
              }

              if($scope.$parent){
                if($scope.$parent.singlePromo)
                  $scope.$parent.singlePromo.dateRange = promoOverview.overviewData.Trend.Date;
                else
                  $scope.$parent.comparePromos.dateRange = promoOverview.overviewData.Trend.Date;
              }

              var ageOrdering = $.map(promoOverview.overviewData['By Age'], function(val,key){
                return key;
              });

              ageOrdering.sort();

              var newAgeData = {}

              for(var i=0; i < ageOrdering.length; i++){
                newAgeData[ageOrdering[i]] = promoOverview.overviewData['By Age'][ageOrdering[i]];
              }

              promoOverview.overviewData['By Age'] = newAgeData;

              $interval(function () {
                $(window).trigger('resize');
                $(".carousel").trigger('resize');
              }, 750, 1);

            })



        }

      };

      this.initialize = function () {
        promoOverview.loadPromotion();

        if($scope.singlePromo){
          $scope.singlePromo.reportFuncCtrl.download = function(elem){

            var tableElem,
              infoObj;

            //promoOverview.generateDataTable($('#highchart'));

            tableElem = $('.promo-overview .desktop table:visible');

            infoObj = {
              filename: 'Promotions_'+ promoOverview.getTableTitle().toUpperCase() + '_'+ promoOverview.getTableTimePeriod().toUpperCase() +'_Overview.csv',
              title: promoOverview.getTableTitle(),
              subtitle: promoOverview.getTableTimePeriod(),
              reportSuite: 'Promotion'
            };

            Highcharts.exportCharts($('.exportable-chart:visible'), {filename:'Promotions_'+ promoOverview.getTableTitle().toUpperCase() + '_'+ promoOverview.getTableTimePeriod().toUpperCase() +'_Overview'});

            //Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
          }
        };

      }();

      this.updateNotes = function () {
        RequestService
          .data('promotion-notes', dataObj)
          .then(function POCinit(info) {

            FilterService.setPromoNoteData(info.data)
            promoOverview.returnedNotes = FilterService.getPromoNoteData();

          });
      };

      this.updateGraph = function (data, type) {
        GraphService.setData(data, type);
      };

      this.getTableTitle = function(){

        return FilterService.displaySelectedPromo();

      };

      this.getTableTimePeriod = function(){

        var copy = "";

        copy += FilterService.displayPromoQtrTimePeriod() +
            " by Week";

        return copy;

      };

      this.predicate = function(val){
        return val;
      };

      promoOverview.unregister.push($scope.$on('DataService:selectedPromo:update', function () {
        promoOverview.loadPromotion();
      }));

      $scope.$on('$destroy', function(){

        var deleteFunction;

        while(promoOverview.unregister.length > 0) {
          deleteFunction = promoOverview.unregister.pop();
          deleteFunction();
        }
      });

      // listens for a setter to be called on FilterService.
      /*unregister = $rootScope.$on('DataService:selectedPromo:update', function () {
       promoOverview.loadPromotion();
       });

      $scope.$on('$destroy', unregister);*/

      $scope.PromotionOverviewController = this;

      return $scope.PromotionOverviewController;

}]);
