altriaMap.controller('EmailCompareController', ['$scope', '$rootScope', '$filter', 'FilterService', 'RequestService', 'Utility', 'ngDialog',
	function (
		$scope, $rootScope, $filter, FilterService, RequestService, Utility, ngDialog
	) {
		$rootScope.layoutClass = "compare";

		var emailCompare = this;

		this.selectedPromos = {};
		this.selectedFilters = {};
		this.sortBy = "Date";
		this.sortAscending = [];
		this.sortAscending["Date"] = false;
    this.filtersOpen  = false;
    this.mobilePromoSelectVisible = true;
    this.filtered = null;

    this.promoList = [];
    this.selectedPromoList = []

		this.sortOptions = [];
    this.selectedSort = "Reminders";

		this.reportFuncCtrl = {};
		this.filterSet = {};
		this.multiComCheckboxVals = function(){

		}



		this.promoSelectionChange = function ( promo ) {

			var multiArr = [];
			var multiStr = '';

      if(promo){

        var inselected = $.inArray(promo,emailCompare.selectedPromoList) >= 0  ;

        if(!inselected) {
          if (emailCompare.selectedPromoList.length >= 9) {

            delete emailCompare.selectedPromos[promo.id];
            var errorMsg = 'Please don\'t select more than 9 items';

            if (!$rootScope.errorDialog) {
              $rootScope.errorDialog = true;
              ngDialog.open({
                template: '' +
                '<h2 class="ng-dialog-error-message ng-dialog-error">' + errorMsg + '</h2>',
                plain: true
              });
            }

            return;
          }
        }

        if(inselected){

          emailCompare.selectedPromoList = $.grep(emailCompare.selectedPromoList, function(value) {
            return value != promo;
          });

        }else {

          emailCompare.selectedPromoList.push(promo);

        }

        promo.selected = emailCompare.selectedPromos[promo.id];

        _.each(emailCompare.selectedPromos, function(v, i){

          if(v) {
            multiArr.push(i);
            multiStr += i;
          }

        })
        FilterService.setPromoMultiSelect(multiArr);
      }

			/*if( !date ){
				FilterService.setPromoQtrTimePeriod($('input:radio[name=promo-list-group]:checked').attr("date"));
			} else {
				FilterService.setPromoQtrTimePeriod(date);
			}*/

		};

		this.sortSelectionChange = function (filter){

			var filterSplit = filter.split(': ');

			switch (filterSplit[0]){

				case "Date":

					emailCompare.sortAscending[filterSplit[0]] = filterSplit[1] == "Newest" ? false : true;

					break;

				case "Length":

					emailCompare.sortAscending[filterSplit[0]] = filterSplit[1] == "Longest" ? false : true;

					break;

				default:

					emailCompare.sortAscending[filterSplit[0]] = true;

					break;

			}

			emailCompare.sortBy = filterSplit[0];

		};

		this.predicate = function(val){

			switch (emailCompare.sortBy){

				case "Date":
					return val[emailCompare.sortBy].split(' ')[1] + ' ' + val[emailCompare.sortBy].split(' ')[0];

				case "Length":

					var length_arr = val[emailCompare.sortBy].split(' ');

					switch(length_arr[1]){

						case "Year":
						case "Years":
							return Math.round(parseInt(length_arr[0]) * 365.25);

						case "Months":
						case "Month":
							return Math.round(parseInt(length_arr[0]) * 30.4375);

						case "Weeks":
						case "Week":
							return parseInt(length_arr[0]) * 7;

						default:
							return parseInt(length_arr[0]);

					}
			}

			return val[emailCompare.sortBy];
		};

		this.sortHandler = function(sortOn, evt){

			emailCompare.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderWhiteDown") || $clickTarget.hasClass("tableHeaderWhiteUp")){
				emailCompare.sortAscending[sortOn]=!emailCompare.sortAscending[sortOn];
			} else {
				emailCompare.sortAscending[sortOn]=true;
			}
		};

    this.orderLengthFilter = function (val){
      return parseInt(val.name.split(/[\s+-]+/)[0]);
    }

		this.createFilters = function(filterData){

			for( var idx in filterData ){

				if(filterData[idx]){
					$.each( filterData[idx] , function(key, value){

						if(!emailCompare.filterSet.hasOwnProperty(key)){
							emailCompare.filterSet[key] = [];
						}

						var valueSplit = $.isArray(value) ? value : value.split(',');

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

							var filtered = $(emailCompare.filterSet[key]).filter(function(){

								if(this.name == currFilterOption){
									this.count++;
									return true;
								}else{
									return false;
								}

							});

							if(filtered.length <= 0){

								emailCompare.filterSet[key].push({name:currFilterOption, count:1});

							} else {
								emailCompare.filterSet[key].count++;
							}
						}

					});
				}
			}

		}

    this.checkFilters = function(){
      var hasSelection = false;

      $.each(emailCompare.selectedFilters, function(key, obj){
        $.each(obj, function(i, v){
          if(v){
            hasSelection = true;
            return false;
          }
        });
        if(hasSelection) return false;
      })

      if(hasSelection){
        emailCompare.selectedFilters.All = {All:false};
      }else{
        emailCompare.clearFilters();
      }
    }

    this.clearFilters = function(){
      emailCompare.selectedFilters = {};
      emailCompare.selectedFilters = {
        All:{
          All:true
        }
      }
    }

		this.filterPromoList = function(promo){

			var filterFound,
				results = {},
				cat;

      if(promo.selected) return false;

			for( var category in emailCompare.selectedFilters ){

				filterFound = null;

				for( var selectedFilter in emailCompare.selectedFilters[category]){

					cat = (category === "Year") ? "Date" : category;

					if(emailCompare.selectedFilters[category][selectedFilter]){

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

    this.onShowPromoCompareDetails =  function(evt){
      emailCompare.mobilePromoSelectVisible = !emailCompare.mobilePromoSelectVisible;

      if(!emailCompare.mobilePromoSelectVisible)
        $("section.promotions").removeClass("ng-hide");

      $(window,"section.promotions").resize()
                                    .scrollTop(0);
    }

    this.isMobile = function(selector){

      return $(selector).is(':visible');
    }

    this.isChecked = function(selector){
      return $(selector).is(':checked');
    }

    this.checkForMaxPromos = function(){
      emailCompare.selectedPromoList.length
    }

		/*this.updateCurrentFilterCounts = function(){

		}*/

		/*this.setComparePromotionCheckbox = function RCcheckCheckbox() {

			var multiArr = [];
			var multiStr = '';

			_.each(emailCompare.multiComCheckboxVals, function (v, i) {

				if (emailCompare.multiComCheckboxVals[i] === true) {

					var str = Utility.transformStringToParameter(emailCompare.communities[i]);

					multiArr.push(str);

					multiStr = multiStr + str;
				}
			});

			FilterService.setPromoMultiSelect(multiArr);

		};*/


		this.initialize = function(){

			FilterService.setPromoSelectType(emailCompare.promoSelectType = 'multi-promo');

			RequestService
				.data('promotion-filters')
				.then(function SPClistCom(info) {

					emailCompare.promoList = info.data.Promotion;

					emailCompare.createFilters(emailCompare.promoList);
          emailCompare.clearFilters();

					///emailCompare.updateCurrentFilterCounts();

					$filter("orderBy")(emailCompare.promoList, emailCompare.sortBy, emailCompare.sortAscending[emailCompare.sortBy]);

					emailCompare.selectedPromo = emailCompare.promoList[0]["id"];

					if($('.promo-list-container.desktop').is(':visible'))
						FilterService.setSelectedPromo(emailCompare.selectedPromo);
					else{
						emailCompare.selectedPromo = '';
						FilterService.setSelectedPromo(emailCompare.selectedPromo);
					}

					FilterService.setPromoQtrTimePeriod(emailCompare.promoList[0]["Date"]);

					for(var key in emailCompare.promoList[0]){

						switch (key){

							case "Date":

								emailCompare.sortOptions.push('Date: Newest');
								emailCompare.sortOptions.push('Date: Oldest');

								break;

							case "Length":

								emailCompare.sortOptions.push('Length: Longest');
								emailCompare.sortOptions.push('Length: Shortest');

								break;

							case "id":

								break;

							default:

								emailCompare.sortOptions.push(key);

								break;

						}
					}

          emailCompare.selectedSort = emailCompare.sortOptions[3];

				});
		}();


		$scope.EmailCompareController = this;
		return $scope.EmailCompareController;
}]);
