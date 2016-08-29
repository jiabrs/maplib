altriaMap.controller('SinglePromotionController', ['$scope', '$rootScope', '$filter', 'FilterService', 'RequestService',
		function (
		$scope, $rootScope, $filter, FilterService, RequestService
			) {

		$rootScope.layoutClass = "single";

		var singlePromo = this;

		this.selectedPromo = '';
		this.sortBy = "Date";
		this.sortAscending = [];
		this.sortAscending["Date"] = false;
    this.filtersOpen  = false;

		this.sortOptions = [];
		//this.selectedSort = "Date: Newest";

		this.dateRange = "";
    this.filterSet = {};
		this.reportFuncCtrl = {};
    this.promoList = [];

		this.promoSelectionChange = function ( date ) {

			FilterService.setSelectedPromo(singlePromo.selectedPromo);

			if( !date ){
				FilterService.setPromoQtrTimePeriod($('input:radio[name=promo-list-group]:checked').attr("date"));
			} else {
				FilterService.setPromoQtrTimePeriod(date);
			}

      $(window).scrollTop(0);

		};

		this.sortSelectionChange = function (filter){

			var filterSplit = filter.split(': ');

			switch (filterSplit[0]){

				case "Date":

					singlePromo.sortAscending[filterSplit[0]] = filterSplit[1] == "Newest" ? false : true;

					break;

				case "Length":

					singlePromo.sortAscending[filterSplit[0]] = filterSplit[1] == "Longest" ? false : true;

					break;

				default:

					singlePromo.sortAscending[filterSplit[0]] = true;

					break;

			}

			singlePromo.sortBy = filterSplit[0];

		};

    this.predicate = function(val){

      var selectedSort = '';

      if( val.selected ){
        selectedSort = singlePromo.sortAscending[comparePromos.sortBy] ? '  ' : 'ZZZZZZ ';
        //console.log("sorting on "+ val.id+" : selectedSort:" + selectedSort );
      }



      switch (singlePromo.sortBy){

        case "Date":
          return selectedSort + val[singlePromo.sortBy].split(' ')[1] + ' ' + val[singlePromo.sortBy].split(' ')[0];

        case "Length":

          var length_arr = val[singlePromo.sortBy].split(' ');

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

      return selectedSort + val[singlePromo.sortBy];
    };

    this.filterPromoList = function(promo){

      var filterFound,
        results = {},
        cat;


      for( var category in singlePromo.selectedFilters ){

        filterFound = null;

        for( var selectedFilter in singlePromo.selectedFilters[category]){

          cat = (category === "Year") ? "Date" : category;

          if(singlePromo.selectedFilters[category][selectedFilter]){

            if( category === "All" ){
              return true;
            }

            if(
              (promo[cat].indexOf(selectedFilter) != -1)  ||
              (cat === "BB Item" && selectedFilter == "Yes" && promo[cat] != "None" ) ||
              (cat === "BB Item" && selectedFilter == "No" && promo[cat].indexOf("None") != -1 )
            ){
              filterFound = true;
              break;

            } else if (cat === "Length"){

              var length = parseInt(promo[cat].split(" ")[0]);

              if((selectedFilter == "1-24 Days" && length >= 1 && length < 25) ||
                (selectedFilter == "25-49 Days" && length >= 25 && length < 50) ||
                (selectedFilter == "50-74 Days" && length >= 50 && length < 75) ||
                (selectedFilter == "75-99 Days" && length >= 75 && length < 100) ||
                (selectedFilter == "100+ Days" && length >= 100)){
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

			singlePromo.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderWhiteDown") || $clickTarget.hasClass("tableHeaderWhiteUp")){
				singlePromo.sortAscending[sortOn]=!singlePromo.sortAscending[sortOn];
			} else {
				singlePromo.sortAscending[sortOn]=true;
			}
		};

    this.orderLengthFilter = function (val){
      return parseInt(val.name.split(/[\s+-]+/)[0]);

    }

    this.createFilters = function(filterData){

      for( var idx in filterData ){

        if(filterData[idx]){
          $.each( filterData[idx] , function(key, value){

            if(!singlePromo.filterSet.hasOwnProperty(key)){
              singlePromo.filterSet[key] = [];
            }

            var valueSplit = $.isArray(value) ? value : value.split(',') ;

            for( var val in valueSplit ) {

              var currFilterOption = valueSplit[val].trim();

              switch (key){

                case "Date":
                  currFilterOption = currFilterOption.split(" ")[1];
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

              }

              var filtered = $(singlePromo.filterSet[key]).filter(function(){

                if(this.name == currFilterOption){
                  this.count++;
                  return true;
                }else{
                  return false;
                }

              });

              if(filtered.length <= 0){

                singlePromo.filterSet[key].push({name: currFilterOption, count:1});

              } else {
                singlePromo.filterSet[key].count++;
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

      $.each(singlePromo.selectedFilters, function(key, obj){
        $.each(obj, function(i, v){
          if(v){
            hasSelection = true;
            return false;
          }
        });
        if(hasSelection) return false;
      })

      if(hasSelection){
        singlePromo.selectedFilters.All = {All:false};
      }else{
        singlePromo.clearFilters();
      }
    }

    this.clearFilters = function(){
      singlePromo.selectedFilters = {};
      singlePromo.selectedFilters = {
        All:{
          All:true
        }
      }
    }

		this.initialize = function(){

      FilterService.setPromoSelectType(singlePromo.promoSelectType = 'single-promo');

			RequestService
				.data('promotion-filters')
				.then(function SPClistCom(info) {

          if(info.data.Promotion.length){
            singlePromo.promoList = info.data.Promotion;

            singlePromo.createFilters(singlePromo.promoList);
            singlePromo.clearFilters();

            $filter("orderBy")(singlePromo.promoList, singlePromo.sortBy, singlePromo.sortAscending[singlePromo.sortBy]);
            singlePromo.selectedPromo = singlePromo.promoList[0]["id"];

            if($('.promo-list-container.desktop').is(':visible'))
              FilterService.setSelectedPromo(singlePromo.selectedPromo);
            else{
              singlePromo.selectedPromo = '';
              FilterService.setSelectedPromo(singlePromo.selectedPromo);
            }

            FilterService.setPromoQtrTimePeriod(singlePromo.promoList[0]["Date"]);

            for(var key in singlePromo.promoList[0]){

              switch (key){

                case "Date":

                  singlePromo.sortOptions.push('Date: Newest');
                  singlePromo.sortOptions.push('Date: Oldest');

                  break;

                case "Length":

                  singlePromo.sortOptions.push('Length: Longest');
                  singlePromo.sortOptions.push('Length: Shortest');

                  break;

                case "id":

                  break;

                default:

                  singlePromo.sortOptions.push(key);

                  break;

              }
            }
          }

          singlePromo.selectedSort = singlePromo.sortOptions[3];

				});

		}();

		$scope.SinglePromotionController = this;
		return $scope.SinglePromotionController;

}]);
