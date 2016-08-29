altriaMap.controller('EmailSingleController', ['$scope', '$rootScope', '$filter', 'FilterService', 'RequestService',
		function (
		$scope, $rootScope, $filter, FilterService, RequestService
			) {

		$rootScope.layoutClass = "single";

		var emailSingle = this;

		this.selectedEmail = '';
		this.sortBy = "Date";
		this.sortAscending = [];
		this.sortAscending["Date"] = false;
    this.filtersOpen  = false;

		this.sortOptions = [];
		//this.selectedSort = "Date: Newest";

		this.dateRange = "";
    this.filterSet = {};
		this.reportFuncCtrl = {};
    this.emailList = [];
    this.itemType = "Email";

		this.emailSelectionChange = function ( value ) {

      console.log("TEsting selection change");
      this.selectedEmail = value;
			FilterService.setSelectedEmail(this.selectedEmail);

			/*if( !value ){
				FilterService.setEmailQtrTimePeriod($('input:radio[name=promo-list-group]:checked').attr("date"));
			} else {
				FilterService.setEmailQtrTimePeriod(date);
			}*/

      $(window).scrollTop(0);

		};

		this.sortSelectionChange = function (filter){

			var filterSplit = filter.split(': ');

			switch (filterSplit[0]){

				case "Date":

					emailSingle.sortAscending[filterSplit[0]] = filterSplit[1] == "Newest" ? false : true;

					break;

				case "Length":

					emailSingle.sortAscending[filterSplit[0]] = filterSplit[1] == "Longest" ? false : true;

					break;

				default:

					emailSingle.sortAscending[filterSplit[0]] = true;

					break;

			}

			emailSingle.sortBy = filterSplit[0];

		};

    this.predicate = function(val){

      var selectedSort = '';

      if( val.selected ){
        selectedSort = emailSingle.sortAscending[compareEmails.sortBy] ? '  ' : 'ZZZZZZ ';
        //console.log("sorting on "+ val.id+" : selectedSort:" + selectedSort );
      }



      switch (emailSingle.sortBy){

        case "Date":
          return selectedSort + val[emailSingle.sortBy].split(' ')[1] + ' ' + val[emailSingle.sortBy].split(' ')[0];

        case "Length":

          var length_arr = val[emailSingle.sortBy].split(' ');

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

      return selectedSort + val[emailSingle.sortBy];
    };

    this.filterEmailList = function(email){

      var filterFound,
        results = {},
        cat;


      for( var category in emailSingle.selectedFilters ){

        filterFound = null;

        for( var selectedFilter in emailSingle.selectedFilters[category]){

          cat = (category === "Year") ? "Date" : category;

          if(emailSingle.selectedFilters[category][selectedFilter]){

            if( category === "All" ){
              return true;
            }

            if(
              (email[cat].indexOf(selectedFilter) != -1)  ||
              (cat === "BB Item" && selectedFilter == "Yes" && email[cat] != "None" ) ||
              (cat === "BB Item" && selectedFilter == "No" && email[cat].indexOf("None") != -1 )
            ){
              filterFound = true;
              break;

            } else if (cat === "Length"){

              var length = parseInt(email[cat].split(" ")[0]);

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

			emailSingle.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderWhiteDown") || $clickTarget.hasClass("tableHeaderWhiteUp")){
				emailSingle.sortAscending[sortOn]=!emailSingle.sortAscending[sortOn];
			} else {
				emailSingle.sortAscending[sortOn]=true;
			}
		};

    this.orderLengthFilter = function (val){
      return parseInt(val.name.split(/[\s+-]+/)[0]);

    }

    this.createFilters = function(filterData){

      for( var idx in filterData ){

        if(filterData[idx]){
          $.each( filterData[idx] , function(key, value){

            if(!emailSingle.filterSet.hasOwnProperty(key)){
              emailSingle.filterSet[key] = [];
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

              var filtered = $(emailSingle.filterSet[key]).filter(function(){

                if(this.name == currFilterOption){
                  this.count++;
                  return true;
                }else{
                  return false;
                }

              });

              if(filtered.length <= 0){

                emailSingle.filterSet[key].push({name: currFilterOption, count:1});

              } else {
                emailSingle.filterSet[key].count++;
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

      $.each(emailSingle.selectedFilters, function(key, obj){
        $.each(obj, function(i, v){
          if(v){
            hasSelection = true;
            return false;
          }
        });
        if(hasSelection) return false;
      })

      if(hasSelection){
        emailSingle.selectedFilters.All = {All:false};
      }else{
        emailSingle.clearFilters();
      }
    }

    this.clearFilters = function(){
      //emailSingle.selectedFilters = {};
      emailSingle.selectedFilters = {
        All:{
          All:true
        }
      }
    }

		this.initialize = function(){

      FilterService.setEmailSelectType(emailSingle.emailSelectType = 'single-email');

			RequestService
				.data('email-filters')
				.then(function SPClistCom(info) {

         var key = Object.keys(info.data)[0]

          if(info.data[key].length){
            emailSingle.emailList = info.data[key];

            /*emailSingle.createFilters(emailSingle.emailList);
            emailSingle.clearFilters();

            $filter("orderBy")(emailSingle.emailList, emailSingle.sortBy, emailSingle.sortAscending[emailSingle.sortBy]);
            emailSingle.selectedEmail = emailSingle.emailList[0]["id"];*/

            if($('.email-list-container.desktop').is(':visible'))
              FilterService.setSelectedEmail(emailSingle.selectedEmail);
            else{
              emailSingle.selectedEmail = '';
              FilterService.setSelectedEmail(emailSingle.selectedEmail);
            }

            FilterService.setEmailQtrTimePeriod(emailSingle.emailList[0]["Date"]);

            for(var key in emailSingle.emailList[0]){

              switch (key){

                case "Date":

                  emailSingle.sortOptions.push('Date: Newest');
                  emailSingle.sortOptions.push('Date: Oldest');

                  break;

                case "Length":

                  emailSingle.sortOptions.push('Length: Longest');
                  emailSingle.sortOptions.push('Length: Shortest');

                  break;

                case "id":

                  break;

                default:

                  emailSingle.sortOptions.push(key);

                  break;

              }
            }
          }

          emailSingle.selectedSort = emailSingle.sortOptions[3];

				});

		}();

		$scope.EmailSingleController = this;
		return $scope.EmailSingleController;

}]);
