(function () {
  "use strict";
  altriaMap.directive ('a', function () {
    return {
      restrict: 'E',
      link: function (scope, elem, attrs) {
        if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
          elem.on ('click', function (e) {
            e.preventDefault ();
          });
        }
      }
    };
  });

  altriaMap.directive ('expandedNotes', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '_res/views/_expandedNotes.html',
      link: function(scope, elem, attrs){

      }
    };
  });

  altriaMap.directive ('mainDropdownMenu', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '_res/views/_mainDropdownMenu.html'
    }
  });

  altriaMap.directive ('reportingFunctions', function () {
    return {
      restrict: 'E'
    , replace: true
    , templateUrl: '_res/views/_reportingFunctions.html'
    , scope: {
        control: '='
      }
    , link: function(scope, element, attrs){

        scope.internalControl = scope.control || {};
        scope.internalControl.onDownloadClick = function RCclickDownload(elem){
          scope.internalControl.download(elem.currentTarget);
        }
      }
    }
  });

  altriaMap.directive ('dateSort', function () {
    return {
      restrict: 'E'
      , replace: true
      , templateUrl: '_res/views/_dateSort.html'
      , scope: {
        control: '='
      }
      , link: function(scope, element, attrs){

      }
    }
  });


  altriaMap.directive ('highchart', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
    , template: '<div></div>'
    , replace: true
    , scope: {
      control: '='
    }
    , link: function (scope, element, attrs, cntrl) {

        GraphService.setElement(element[0]);

        window.el = element;

        var targetElem = element[0];

        scope.internalControl = scope.control || {};

        scope.internalControl.download = function RCclickDownload(tab){

          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
          $(targetElem).highcharts().exportChart();
          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);

        }

        //angular.element($window).resize(_.debounce(function(){
        //    cntrl.moveIndicatorArrow();
        //}, 500));

        scope.$on('destroy', function(){
          angular.element($window).unbind('resize');
        });

      }
    };
  }]);

  altriaMap.directive ('promohighchart', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
    , template: '<div></div>'
    , replace: true
    , scope: {
      control: '='
    }
    , link: function (scope, element, attrs, cntrl) {
        GraphService.setElement(element[0]);
        window.el = element;

        var targetElem = element[0];

        scope.internalControl = scope.control || {};

        scope.internalControl.download = function RCclickDownload(tab){

          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
          $(targetElem).highcharts().exportChart();
          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);

        }

        angular.element($window).resize(_.debounce(function(){
            //cntrl.moveIndicatorArrow();
        }, 500));

        scope.$on('destroy', function(){
          angular.element($window).unbind('resize');
        });
      }
    };
  }]);

  altriaMap.directive ('overviewTable', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
      , template: '<div></div>'
      , replace: true
      //, controller : 'PromotionOverviewController'
      //, controllerAs: 'promoOverview'
      , scope: {
        graphData : "@",
        control: "="
      }
      , link: function (scope, element, attrs, cntrl) {

        GraphService.setElement(element[0]);
        window.el = element;

        var targetElem = element[0];

        scope.internalControl = scope.control || {};

        scope.internalControl.downloadHighChart = function RCclickDownload(tab){

          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
          $(targetElem).highcharts().drawTable();
          $(targetElem).highcharts().exportChart();
          $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);

        }

        attrs.$observe("graphData", function(value) {
          value = $.parseJSON(value);
          GraphService.setData(value.data, "overviewTable", element, value.dateRange ? (value.dateRange.start + " - " + value.dateRange.end ) : null );
          $(targetElem).find(".highcharts-axis-labels, .highcharts-tracker, .highcharts-data-labels, .highcharts-title, .highcharts-series, .highcharts-grid, .highcharts-axis").css("opacity",0);
          element.animate();
        });

        scope.$on('destroy', function(){
          angular.element($window).unbind('resize');
        });
      }
    };
  }]);

  altriaMap.directive ('emailOverviewTable', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
      , template: '<div></div>'
      , replace: true
      //, controller : 'PromotionOverviewController'
      //, controllerAs: 'promoOverview'
      , scope: {
        graphData : "@",
        control: "="
      }
      , link: function (scope, element, attrs, cntrl) {

        GraphService.setElement(element[0]);
        window.el = element;

        var targetElem = element[0];

        //scope.internalControl = scope.control || {};
        //
        //scope.internalControl.downloadHighChart = function RCclickDownload(tab){
        //
        //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
        //  $(targetElem).highcharts().drawTable();
        //  $(targetElem).highcharts().exportChart();
        //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);
        //
        //}

        attrs.$observe("graphData", function(value) {
          value = $.parseJSON(value);
          GraphService.setData(value.data, "emailOverviewTable", element, value.dateRange ? (value.dateRange.start + " - " + value.dateRange.end ) : null );
          $(targetElem).find(".highcharts-axis-labels, .highcharts-tracker, .highcharts-data-labels, .highcharts-title, .highcharts-series, .highcharts-grid, .highcharts-axis").css("opacity",0);
          element.animate();
        });

        scope.$on('destroy', function(){
          angular.element($window).unbind('resize');
        });
      }
    };
  }]);

  altriaMap.directive ('overviewHighChart', ['GraphService' , '$window', function (GraphService, $window) {
    return {
        restrict: 'E'
      , template: '<div></div>'
      , replace: true
      //, controller : 'PromotionOverviewController'
      //, controllerAs: 'promoOverview'
      , scope: {
          graphData : "@",
          control: "="
        }
      , link: function (scope, element, attrs, cntrl) {

          GraphService.setElement(element[0]);
          window.el = element;

          var targetElem = element[0];

          scope.internalControl = scope.control || {};

          scope.internalControl.downloadHighChart = function RCclickDownload(tab){

            $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
            $(targetElem).highcharts().drawTable();
            $(targetElem).highcharts().exportChart();
            $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);

          }

          attrs.$observe("graphData", function(value) {
            GraphService.setData(value, "overviewHighChart", element);
            element.animate();
          });

          scope.$on('destroy', function(){
            angular.element($window).unbind('resize');
          });
      }
    };
  }]);

  altriaMap.directive ('overviewPieChart', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
    , template: '<div></div>'
    , replace: true
    //, controller : 'PromotionOverviewController'
    //, controllerAs: 'promoOverview'
    , scope: {
          graphData : "@",
          control: "="
        }
    , link: function (scope, element, attrs) {

          GraphService.setElement(element[0]);
          window.el = element;

          var targetElem = element[0];

          //scope.internalControl = scope.control || {};
          //
          //if(!scope.internalControl.downloadPieChart)
          //  scope.internalControl.downloadPieChart = [];
          //
          //scope.internalControl.downloadPieChart.push(function RCclickDownload(tab){
          //
          //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
          //  $(targetElem).highcharts().exportChart();
          //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);
          //
          //});

          attrs.$observe("graphData", function(value) {
            GraphService.setData(value, "overviewPieChart", element, attrs.title);
          });

          scope.$on('destroy', function(){
            angular.element($window).unbind('resize');
          });
      }

    };
  }]);

  altriaMap.directive('overviewHorizontalBarChart', ['GraphService' , '$window', function (GraphService, $window) {
    return {
      restrict: 'E'
      , template: '<div></div>'
      , replace: true
      , controller : 'EmailOverviewController'
      , controllerAs: 'promoOverview'
      , scope: {
        graphData : "@",
        isMobile : "@",
        //control: "="
      }
      , link: function (scope, element, attrs, cntrl) {
        GraphService.setElement(element[0]);
        window.el = element;

        var targetElem = element[0];

        scope.internalControl = scope.control || {};

        //if(!scope.internalControl.downloadPieChart)
        //  scope.internalControl.downloadPieChart = [];
        //
        //scope.internalControl.downloadPieChart.push(function RCclickDownload(tab){
        //
        //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",1);
        //  $(targetElem).highcharts().exportChart();
        //  $(targetElem).find(".highcharts-title,.highcharts-subtitle,.highcharts-button,.highcharts-legend").css("opacity",0);
        //
        //});
        attrs.$observe("graphData", function(value) {
          if(scope.isMobile == 'true') {
            attrs.title = 'mobile';
            GraphService.setData(value, "overviewHorizontalBarChart", element, attrs.title);
          }
          else{
            GraphService.setData(value, "overviewHorizontalBarChart", element, attrs.title);
          }
        });

        scope.$on('destroy', function(){
          angular.element($window).unbind('resize');
        });

      }
    };
  }]);

  altriaMap.directive("fileread", [function () {
    return {
      scope: {
        fileread: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          var reader = new FileReader();
          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.fileread = loadEvent.target.result;
            });
          };

          reader.readAsDataURL(changeEvent.target.files[0]);
        });
      }
    };
  }]);

  altriaMap.directive("filteredPicker", function factory() {
    return {

      restrict: 'AE',

      scope: {
        results: '=',
        filtersOpen: '=',
        selectedItem: '=',
        sortBy: "=",
        sortAscending: '=',
        sortOptions : '=',
        dateRange : "=",
        filterSet : '=',
        itemList : '=',
        selectedFilters : '=',
        onItemSelect : '=',
        itemType: '='
      },

      templateUrl: '_res/templates/filteredPicker.html',

      //properties
      controller : function($scope, $element, $attrs, $transclude, $filter){

        var filteredPickerCtrl = this;

        filteredPickerCtrl.filtersOpen = false;
        filteredPickerCtrl.selectedItem = null;
        filteredPickerCtrl.sortBy = "Date";
        filteredPickerCtrl.sortAscending = [];
        filteredPickerCtrl.sortOptions = [];
        filteredPickerCtrl.dateRange = "";
        filteredPickerCtrl.filterSet = {};
        filteredPickerCtrl.itemList = [];
        filteredPickerCtrl.selectedFilters = {};
        filteredPickerCtrl.VOWELS = ["a","e","i","o","u"];

        //filteredPickerCtrl.internalControl = $scope.control || {};
        //scope.internalControl.selectItem =

        this.sortSelectionChange = function (filter){

          var filterSplit = filter.split(': ');

          switch (filterSplit[0]){

            case "Date":

              filteredPickerCtrl.sortAscending[filterSplit[0]] = filterSplit[1] == "Newest" ? false : true;

              break;

            case "Length":

              filteredPickerCtrl.sortAscending[filterSplit[0]] = filterSplit[1] == "Longest" ? false : true;

              break;

            default:

              filteredPickerCtrl.sortAscending[filterSplit[0]] = true;

              break;

          }

          filteredPickerCtrl.sortBy = filterSplit[0];

        };

        this.predicate = function(val){

          var selectedSort = '';

          if( val.selected ){
            selectedSort = filteredPickerCtrl.sortAscending[compareItems.sortBy] ? '  ' : 'ZZZZZZ ';
            //console.log("sorting on "+ val.id+" : selectedSort:" + selectedSort );
          }



          switch (filteredPickerCtrl.sortBy){

            case "Date":
              return selectedSort + val[filteredPickerCtrl.sortBy].split(' ')[1] + ' ' + val[filteredPickerCtrl.sortBy].split(' ')[0];

            case "Length":

              var length_arr = val[filteredPickerCtrl.sortBy].split(' ');

              switch(length_arr[1]){

                case "Year":
                case "Years":
                  return selectedSort + Math.round(parseInt(length_arr[0]) * 365.25);

                case "Months":
                case "Month":
                  return selectedSort + Math.round(parseInt(length_arr[0]) * 30.4375);

                case "Weeks":
                case "Week":
                  return selectedSort + parseInt(length_arr[0]) * 7;

                default:
                  return selectedSort.length ? selectedSort + parseInt(length_arr[0]) : parseInt(length_arr[0]);

              }
          }

          return selectedSort + val[filteredPickerCtrl.sortBy];
        };

        this.filterItemList = function(item){

          var filterFound,
            results = {},
            cat;


          for( var category in filteredPickerCtrl.selectedFilters ){

            filterFound = null;

            for( var selectedFilter in filteredPickerCtrl.selectedFilters[category]){

              cat = (category === "Year") ? "Date" : category;

              if(filteredPickerCtrl.selectedFilters[category][selectedFilter]){

                if( category === "All" ){
                  return true;
                }

                if(
                  (item[cat].toString().indexOf(selectedFilter) != -1)  ||
                  (cat === "BB Item" && selectedFilter == "Yes" && item[cat] != "None" ) ||
                  (cat === "BB Item" && selectedFilter == "No" && item[cat].indexOf("None") != -1 )
                ){
                  filterFound = true;
                  break;

                } else if (cat === "Length") {

                  var length = parseInt(item[cat].toString().split(" ")[0]);

                  if ((selectedFilter == "1-24 Days" && length >= 1 && length < 25) ||
                    (selectedFilter == "25-49 Days" && length >= 25 && length < 50) ||
                    (selectedFilter == "50-74 Days" && length >= 50 && length < 75) ||
                    (selectedFilter == "75-99 Days" && length >= 75 && length < 100) ||
                    (selectedFilter == "100+ Days" && length >= 100)) {
                    filterFound = true;
                    break;
                  } else {
                    filterFound = false;
                  }
                } else if (cat === "Quantity" || cat == "Quauntity") {

                  var qty = parseInt(item[cat].toString().split(" ")[0]);

                  if ((selectedFilter == "1 - 299M" && qty >= 1 && qty < 300000) ||
                    (selectedFilter == "300M - 799M" && qty >= 300000 && qty < 800000) ||
                    (selectedFilter == "800M - 1.3MM" && qty >= 800000 && qty < 1400000) ||
                    (selectedFilter == "1.4MM - 2MM" && qty >= 1400000 && qty < 2000000) ||
                    (selectedFilter == "2.1MM - 3MM" && qty >= 2000000 && qty < 3000000) ||
                    (selectedFilter == "3.1MM+" && qty >= 3000000)) {
                    filterFound = true;
                    break;
                  } else {
                    filterFound = false;
                  }

                } else {
                  filterFound = false;
                }
              }
            }

            results[category] = filterFound;

          }

          for( var c in results ){
            if( results[c] == false ) return false;
          }

          return true;
        }

        this.sortHandler = function(sortOn, evt){

          filteredPickerCtrl.sortBy = sortOn;

          var $clickTarget = $(evt.currentTarget);

          if($clickTarget.hasClass("tableHeaderWhiteDown") || $clickTarget.hasClass("tableHeaderWhiteUp")){
            filteredPickerCtrl.sortAscending[sortOn]=!filteredPickerCtrl.sortAscending[sortOn];
          } else {
            filteredPickerCtrl.sortAscending[sortOn]=true;
          }
        };

        this.orderLengthFilter = function (val){
          return parseInt(val.name.split(/[\s+-]+/)[0]);

        }

        this.createFilters = function(filterData){

          for( var idx in filterData ){

            if(filterData[idx]){
              $.each( filterData[idx] , function(key, value){

                if(!filteredPickerCtrl.filterSet.hasOwnProperty(key)){
                  filteredPickerCtrl.filterSet[key] = [];
                }

                var valueSplit;

                if( isNaN(value) ){
                  valueSplit = $.isArray(value) ? value : value.split(',')
                }
                else{
                  valueSplit = [value];
                }


                for( var val in valueSplit ) {

                  var currFilterOption = isNaN(valueSplit[val]) ? valueSplit[val].trim() : valueSplit[val];

                  switch (key){

                    case "Date":
                      currFilterOption = currFilterOption.split(" ")[1] || $filter('date')(currFilterOption, 'yyyy');
                      break;

                    case "BB Item":
                      currFilterOption = currFilterOption === "None" ? "No" : "Yes";
                      break;

                    case "Length":

                      var length = parseInt(currFilterOption.split(" ")[0]);

                      if(length < 25){
                        currFilterOption = "1-24 Days";
                      }else if(length < 50){
                        currFilterOption = "25-49 Days";
                      }else if(length < 75){
                        currFilterOption = "50-74 Days";
                      }else if(length < 100){
                        currFilterOption = "75-99 Days";
                      }else{
                        currFilterOption = "100+ Days";
                      }

                      break;

                    case "Quantity":
                    case "Quauntity":

                      var qty = parseInt(currFilterOption.toString().split(" ")[0]);

                      if(qty < 300000){
                        currFilterOption = "1 - 299M";
                      }else if(qty < 800000){
                        currFilterOption = "300M - 799M";
                      }else if(qty < 1400000){
                        currFilterOption = "800M - 1.3MM";
                      }else if(qty < 2000000){
                        currFilterOption = "1.4MM - 2MM";
                      }else if(qty < 3000000){
                        currFilterOption = "2.1MM - 3MM";
                      }else{
                        currFilterOption = "3.1MM+";
                      }

                      break;

                  }

                  var filtered = $(filteredPickerCtrl.filterSet[key]).filter(function(){

                    if(this.name == currFilterOption){
                      this.count++;
                      return true;
                    }else{
                      return false;
                    }

                  });

                  if(filtered.length <= 0){

                    filteredPickerCtrl.filterSet[key].push({name: currFilterOption, count:1});

                  } else {
                    filteredPickerCtrl.filterSet[key].count++;
                  }
                }

              });
            }
          }

        }

        this.isMobile = function(selector){

          return $(selector).is(':visible');
        }

        this.isChecked = function(selector){
          return $(selector).is(':checked');
        }

        this.checkFilters = function(){
          var hasSelection = false;

          $.each(filteredPickerCtrl.selectedFilters, function(key, obj){
            $.each(obj, function(i, v){
              if(v){
                hasSelection = true;
                return false;
              }
            });
            if(hasSelection) return false;
          })

          if(hasSelection){
            filteredPickerCtrl.selectedFilters.All = {All:false};
          }else{
            filteredPickerCtrl.clearFilters();
          }
        }

        this.clearFilters = function(){
          filteredPickerCtrl.selectedFilters = {};
          filteredPickerCtrl.selectedFilters = {
            All:{
              All:true
            }
          }
        }

        this.initialize = function(){
          filteredPickerCtrl.itemList = $scope.results;
          filteredPickerCtrl.itemType = $scope.itemType;

          if(filteredPickerCtrl.itemList.length){
            filteredPickerCtrl.createFilters(filteredPickerCtrl.itemList);
            filteredPickerCtrl.clearFilters();

            $filter("orderBy")(filteredPickerCtrl.itemList, filteredPickerCtrl.sortBy, filteredPickerCtrl.sortAscending[filteredPickerCtrl.sortBy]);
            //filteredPickerCtrl.selectedItem = filteredPickerCtrl.itemList[0]["id"];
            filteredPickerCtrl.selectItem(filteredPickerCtrl.itemList[0]);
          }
        };

        this.selectItem = function(newSelectedItem){
          $scope.selectedItem = filteredPickerCtrl.selectedItem = newSelectedItem;
          //filteredPickerCtrl.selectedItem = newSelectedItem['id'];
          $scope.onItemSelect(newSelectedItem);
        }

        $scope.$watch('results', function(value) {
          if(filteredPickerCtrl.itemList != value){
            filteredPickerCtrl.initialize();
          }
        });

        $scope.filteredPickerCtrlController = this;
        return $scope.filteredPickerCtrlController;


      },
      controllerAs : 'filteredPickerCtrl',

      compile: function complile(tElem, tAttrs, transclude){
        return{
          pre: function preLink(scope , iElem, iAttrs, ctrl){},
          post: function postLink(scope, iElem, iAttrs, ctrl){}
        }
      }

    };
  });

//  altriaMap.directive ('err', ['ngDialog', function(ngDialog){
//    return{
//      restrict: 'E'
//    , templateUrl: '_res/view/_error.html'
//    , scope :{
//        message : "@"
//      }
//    , controller: 'ErrorController'
//    , controllerAs: 'err'
//    , link: function (scope, elem, attr) {
//
//      }
//    };
//  }]);


}) ();



