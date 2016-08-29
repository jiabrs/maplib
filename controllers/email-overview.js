altriaMap.controller('EmailOverviewController', [
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

		  var emailOverview = this;
      this.unregister = [];
      emailOverview.overviewData = {};
      emailOverview.mobileOverviewData = {};
      emailOverview.overviewTableData = {data:null, dateRange:null};
      emailOverview.slides = [0,1,2];


      this.loadEmail = function () {

       // if (FilterService.getSelectedPromo().length && $scope.singlePromo.promoList.length) {

          if( FilterService.getSelectedEmail().toString().length ) {

        //  emailOverview.emailName = FilterService.getSelectedEmail()['Name'];

            emailOverview.emailName = FilterService.getSelectedEmail();

          var dataObj = {
            emailName: emailOverview.emailName
          };

          RequestService
            .data('email-overview', dataObj)
            .then(function POCinit(info){






              var dat_obj = {

                "cta": info.data['CTA'],
                "subject-line":{
                  "openrate" : _.map(info.data['subject'], 'Open Rate' ),
                  "clickopen" :  _.map(info.data['subject'], 'Click-to-Open Rate' ),
                  "subject":   _.map(info.data['subject'], 'Subject' )

                },
                "totals": info.data.Totals,
                "Name" : info.data.Name,
                "Date": info.data.Date //can be in milliseconds,
              }

              emailOverview.overviewData = dat_obj;
              emailOverview.mobileOverviewData = dat_obj;

              emailOverview.overviewTableData = {
                data: dat_obj.totals
              }

              $interval(function () {
                $(window).trigger('resize');
                $(".carousel").trigger('resize');
              }, 750, 1);

            })
        }

      };

      this.initialize = function () {
        emailOverview.loadEmail();

        if($scope.emailSingle){
          $scope.emailSingle.reportFuncCtrl.download = function(elem){

            var tableElem,
              infoObj;

            //emailOverview.generateDataTable($('#highchart'));

            tableElem = $('.email-promo-overview .desktop table:visible');

            infoObj = {
              filename: 'Eamils_'+ emailOverview.getTableTitle().toUpperCase() + '_'+ emailOverview.getTableTimePeriod().toUpperCase() +'_Overview.csv',
              title: emailOverview.getTableTitle(),
              subtitle: emailOverview.getTableTimePeriod(),
              reportSuite: 'Promotion'
            };

            Highcharts.exportCharts($('.exportable-chart:visible'), {filename:'Promotions_'+ emailOverview.getTableTitle().toUpperCase() + '_'+ emailOverview.getTableTimePeriod().toUpperCase() +'_Overview'});

            //Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
          }
        };

      }();

      this.updateNotes = function () {
        RequestService
          .data('promotion-notes', dataObj)
          .then(function POCinit(info) {

            FilterService.setPromoNoteData(info.data)
            emailOverview.returnedNotes = FilterService.getPromoNoteData();

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

      this.getTableTimePeriod = function(){

        //var copy = "";
        //
        //copy += FilterService.displayPromoQtrTimePeriod() +
        //  " by Week";

        return 'test table title';

      };

      this.predicate = function(val){
        return val;
      };

      this.showpop = function(){

        if(event.target.className =='js-ellipse'){

          $('.js-ellipse').tooltip({open: function( event, ui ) {
            $('.ui-tooltip-content').css({"font-size":"10px", "width":"12em","border": "1px solid black", "background-color":"#fdf7ec"})}});
        }

      }
      emailOverview.unregister.push($scope.$on('DataService:selectedEmail:update', function () {
        emailOverview.loadEmail();
      }));

      $scope.$on('$destroy', function(){

        var deleteFunction;

        while(emailOverview.unregister.length > 0) {
          deleteFunction = emailOverview.unregister.pop();
          deleteFunction();
        }
      });

      // listens for a setter to be called on FilterService.
      /*unregister = $rootScope.$on('DataService:selectedPromo:update', function () {
       emailOverview.loadPromotion();
       });

      $scope.$on('$destroy', unregister);*/

      $scope.EmailOverviewController = this;

      return $scope.EmailOverviewController;

}]);
