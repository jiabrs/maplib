altriaMap.controller('ReportingController', [
  '$scope'
, '$rootScope'
, '$window'
, '$filter'
, 'ngDialog'
, 'FilterService'
, 'GraphService'
, 'RequestService'
, 'Utility'
, 'TIME_PERIOD_OPTIONS'
    ,
		function (
		$scope, $rootScope, $window, $filter, ngDialog, FilterService, GraphService, RequestService, Utility, TIME_PERIOD_OPTIONS) {

		var report = this;
		var _debug = false;

		this.reportFuncCtrl = {};

		this.currentDates = new Date();
    this.multiCommunitySelect = {};
    this.currentMultiCommunitySelect = {};
    this.multiComCheckboxVals = {};


    //Previously the close 'select communities' button logic below is in the view binding by ng-lick. However, it seems there is some conflict
    //with the angulartouch, on an iphone the radio buttons are not selectable. I move it to the controller to fix the problem.  Maybe there
    // are better solutions than this.   -Jia
     var w = angular.element($window);
      w.on('click',function(evt){
        var _$clickTarget = $(evt.target);

        if(!_$clickTarget.is(".multi-select-item")) {

          if (report.multiCommunitySelectOpen) {

            if(_$clickTarget.is(".select-multiple-options button")) {
              closeMultiSelect(evt);
            } else if(!_$clickTarget.is(".clearfix input[type='checkbox']") && !_$clickTarget.is(".clearfix label") ) {
              closeMultiSelect(evt, false);
            }

          }
        }
        evt.stopImmediatePropagation();

      })

		function debug(from, thing) {
			if (_debug === true) {
				//console.log(from);
				//console.log(thing);
			}
		}

		(function initialize() {
			$rootScope.layoutClass = "reporting";

      FilterService.setCommunitySelectType('single-community');
      FilterService.setMultiCommunitySelect('');
      FilterService.setMultiCommunitySelectOpen(false);

			RequestService.
			data('listCommunities').
			then(function RClistCom(info) {
				report.communities = info.data;

        //report.communities.unshift('all communities');
				report.singleCommunitySelect = info.data[0];
				/*report.multiComCheckboxVals = _.map(info.data, function (v, i) {
					return Utility.transformStringToParameter(v);
				});*/
				debug('RClistCom', info.data);
			});

			RequestService.
			data().
			then(function RCdata(info) {
				report.chartData = FilterService.displayChartData();
				report.currentDates = info.data.Date;
				report.tableData = formatTableData(info.data);
				debug('RCdata', info.data);
			});

			RequestService.
			data('note').
			then(function RCdata(info) {
				report.noteData = info.data.docs;
				debug('NoteData', info.data);
			});

			report.communitySelectType = FilterService.getCommunitySelectType();
			report.filterOptions = FilterService.filterOptions();

			report.multiCommunitySelectOpen = FilterService.getMultiCommunitySelectOpen();

			report.timePeriod = TIME_PERIOD_OPTIONS[1]//.value;
			report.timePeriodType = FilterService.getTimePeriodType();


			report.dateOptionsStart = {
				minDate: '-5y',
				maxDate: function () {
					return (report.dateEnd) ? report.dateEnd : 0;
				}()

			};
			report.dateOptionsEnd = {
				minDate: function () {
					return (report.dateStart) ? report.dateStart : '-5y';
				}(),
				maxDate: '0'

			};
			report.timePeriodOptions = TIME_PERIOD_OPTIONS;

			debug('RCinitialize', report);
		})();

		function updateScope() {
			report.communitySelectType = FilterService.getCommunitySelectType();
			report.multiCommunitySelectOpen = FilterService.getMultiCommunitySelectOpen();
			report.timePeriod = FilterService.displayTimePeriod();
			report.timePeriodType = FilterService.getTimePeriodType();

			if (report.communitySelectType === 'single-community') {
				report.singleCommunitySelect = FilterService.getSingleCommunitySelect();
			} else if (report.communitySelectType === 'multi-community') {

        report.multiCommunitySelect = FilterService.getMultiCommunitySelect();
        /*if(report.multiCommunitySelect) report.currentMultiCommunitySelect = jQuery.extend({}, report.multiCommunitySelect);*/
      }
			debug('RCupdateScope', report);
		}

		function checkValidCommunity() {
			if (report.communitySelectType === 'multi-community') {
				if (FilterService.getMultiCommunitySelect() === '') {
					if (!$rootScope.errorDialog) {
            $rootScope.errorDialog = true;
            ngDialog.open({
              template: '' +
              '<h2 class="ng-dialog-error-message ng-dialog-error">Please select communities to compare.</h2>',
              plain: true
            });
          }
					return false;
				} else {
					return true;
				}
			}

			if (report.communitySelectType === 'single-community') {
				if (FilterService.getSingleCommunitySelect() === '') {
          if (!$rootScope.errorDialog) {
            $rootScope.errorDialog = true;
            ngDialog.open({
              template: '' +
              '<h2 class="ng-dialog-error-message ng-dialog-error">Please select a community.</h2>',
              plain: true
            });
          }
					return false;
				} else {
					return true;
				}
			}

			return false;

		}

		this.updateGraph = function() {
			if (checkValidCommunity()) {
				var reqType = '';
				if (report.communitySelectType === 'multi-community') {
					reqType = 'compareMultipleCommunities';
				}

        var promise = RequestService.data(reqType);
        if(promise) {

          promise.then(function RCsetComData(info) {

              FilterService.setChartData(info.data);

              report.chartData = FilterService.displayChartData();
              report.currentDates = info.data.Date;

              GraphService.setData(info, reqType);

              // convenience
              var multiple = FilterService.getCommunitySelectType() === 'multi-community' ? true : false;

              // for multiple communities, the returned object is structured differently, so we have to parse it here and pretend the community names are in "date"
              if (multiple) {
                report.tableData = [];
                _.each(info.data['Community'], function (data, title) {
                  //_dataObj['date']['data'].push(title);
                  //console.log("creating multiple table object")
                  data['Date'] = title;
                  report.tableData.push(data);
                });
                report.tableData['Total'] = info.data.Total;

              } else {
                report.mobileTableData = FilterService.getChartData();
                report.tableData = formatTableData(info.data);
              }

              //report.tableData = formatTableData(info.data);
              debug('RCsetComData', info);
          });
        }
      }
		}


		this.updateNotes = function updateNotes() {
			if (checkValidCommunity()) {
				RequestService.
				data('note').
				then(function RCsetNoteData(info) {
					FilterService.setNoteData(info.data.docs);
					report.returnedNotes = FilterService.displayNoteData();
					debug('RCsetNoteData', info);
				});
			}
		};

		this.updateTimePeriodType = function RCupdateTimePeriodType(timePeriodType) {
			FilterService.setTimePeriodType(timePeriodType);
			this.setDateRange();
			debug('RCupdateTimePeriodType', timePeriodType);
		};
		this.setCommunitySelectType = function RCcommunitySelectType(communitySelectType) {
			debug('RCcommunitySelectType', communitySelectType);

			FilterService.setCommunitySelectType(communitySelectType);

			if (communitySelectType === 'multi-community' && FilterService.getMultiCommunitySelect() === '') {
				return;
			}

			report.updateGraph();
		};

		/*
      TODO: we need to get Matt or whoever to standardize the request format:
        with communities the format is all lower case, replace spaces and special
        characters with "-"
        but with timePeriod it's multicase, with commas allowed.

      */
		this.updateTimePeriod = function RCupdateTimePeriod(timePeriod) {
			FilterService.setTimePeriod(timePeriod);
			report.updateGraph();
			report.updateNotes();
			debug('RCupdateTimePeriod', timePeriod);
		};
		this.setDateRange = function RCdateRange() {
			var str;

			/*
				TODO: this is a hack because the model was not updating immediately on blur. updateOn:blur on the inputs didn't work. A tiny delay makes it work.
				*/
			setTimeout(function () {
        if (report.dateStart && report.dateEnd) {
          if(report.dateEnd.indexOf('99999') === -1) { //move the setEndDate logic here, or the end date datepicker won't show up on the second click for some reason
            report.dateEnd = (parseInt(report.dateEnd) + 86399999).toString();
          }
					if (report.dateStart > report.dateEnd) {
            if (!$rootScope.errorDialog) {
              $rootScope.errorDialog = true;
              ngDialog.open({
                template: '<h2 class="ng-dialog-error-message ng-dialog-error">Please select a start date that occurs prior to the end date.</h2>',
                plain: true
              });
            }
						report.dateStart = null;
						report.dateEnd = null;
						return;
					}else if(report.dateStart === report.dateEnd){
						//console.log("same date");
						/*var tempDate = new Date(parseInt(report.dateStart))

						report.dateStart = Date.UTC(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate()).toString();*/

						var oldDate = new Date(parseInt(report.dateEnd));
						var newDate = new Date(Date.UTC(oldDate.getUTCFullYear(), oldDate.getUTCMonth(), oldDate.getUTCDate()));

						newDate.setUTCDate(newDate.getUTCDate()+1);

						report.dateEnd = String(newDate.getTime() - 1)

					}
					str = Utility.transformStringToParameter([report.dateStart, report.dateEnd]);
					FilterService.setTimePeriod({value:str});
					report.updateGraph();
					report.updateNotes();
				}
			}, 200)
		};

		this.multiSelectAll = function RCMultiSelectAll() {
			var multiArr = [];
			var multiStr = '';

			_.each(report.communities, function (v, i) {
				report.multiComCheckboxVals[v] = report.multiAllSelected;
				var str = Utility.transformStringToParameter(v);

				if (str != 'all') {
					multiArr.push(str);
				}

				multiStr = multiStr + str;
			});
			//console.log("multiSelectAll: "+community);
			FilterService.setMultiCommunitySelect(multiArr);
		};

		this.setSingleCommunity = function RCsetCom(community) {

      if(community === "all communities") community = "all"
			FilterService.setSingleCommunitySelect(community);
			report.updateGraph();
			report.updateNotes();

			debug('RCsetCom', community);
		};
		this.setMultiCommunity = function RCsetCom(community) {
			//console.log("setMultiCommunity: "+community);
			FilterService.setMultiCommunitySelect(community);
			report.updateGraph();
			report.updateNotes();
			debug('RCsetCom', community);
		};

		this.getSelectedMultiCommunities = function RCgetSelectedMultiCommunities() {

      var selection = FilterService.displayMultiCommunitySelect();

      if(selection)
			  var str =  $filter('deslug')(FilterService.displayMultiCommunitySelect().join(", "));
			  //FilterService.displayMultiCommunitySelect().toString();
			//console.log("getSelectedMultiCommunities: "+str);
			return str ? Utility.truncateString(str, 38) : "";

		};

    this.toggleMultiSelectDropdown = function(evt){

      var _$clickTarget = $(evt.target);

      if(!_$clickTarget.is(".multi-select-item")) {

        if (!report.multiCommunitySelectOpen && _$clickTarget.is("button.select-box")) {

          openMultiSelect(evt);

        } else if (report.multiCommunitySelectOpen) {

          if(_$clickTarget.is(".select-multiple-options button")) {
            closeMultiSelect(evt);
          } else if(!_$clickTarget.is(".clearfix input[type='checkbox']") && !_$clickTarget.is(".clearfix label") ) {
            closeMultiSelect(evt, false);
          }

        }
      }
      evt.stopImmediatePropagation();

    }

		function openMultiSelect(evt) {

			FilterService.setMultiCommunitySelectOpen(true);
      report.currentMultiComCheckboxVals = $.extend({}, report.multiComCheckboxVals);
			updateScope();
			debug('RCopenMultiSelect', true);
			//console.log('Communities: '+report.communities);
      evt.stopPropagation();
		};

		function closeMultiSelect( evt, updateContent ) {

      updateContent = updateContent == null ? true : updateContent;

      if (report.multiCommunitySelectOpen){

        if(!updateContent){
          report.multiComCheckboxVals = $.extend({}, report.currentMultiComCheckboxVals);
        }

        FilterService.setMultiCommunitySelect($.map(report.multiComCheckboxVals, function(v, i){
           if(v) return $filter('slug')(i);
        }));

        FilterService.setMultiCommunitySelectOpen(false);

        updateScope();

        if(updateContent){
          report.updateGraph();
          report.updateNotes();
        }
      }
      if(evt){
        evt.stopPropagation();
      }

			debug('RCcloseMultiSelect', false);

		};

   this.recoverMultiSelect = function(evt) {
       // report.multiComCheckboxVals = report.currentMultiComCheckboxVals;
        closeMultiSelect(evt,false);
   }


		this.setMultiCommunityCheckbox = function RCcheckCheckbox(community) {
			var multiArr = [];
			var multiStr = '';

			var allTrue = true;

			_.each(report.multiComCheckboxVals, function (v, i) {
				if (report.multiComCheckboxVals[i] === true) {
					var str = Utility.transformStringToParameter(report.communities[i]);

					if (str != 'all') {
						multiArr.push(str);
					}

					multiStr = multiStr + str;
				} else {
					allTrue = false;
				}
			});

			report.multiAllSelected = allTrue;
			//console.log("setMultiCommunityCheckbox: "+community);
			//console.log("setMultiCommunityCheckbox - multiArr: "+multiArr.toString());
			//FilterService.setMultiCommunitySelect(multiArr);

		};

    //this.setEndDate = function(){
    //  report.dateEnd = (parseInt(report.dateEnd) + 86399999).toString();
    //}

		function formatTableData(data, multipleTitle){
			var formattedData = [];
			report.tableOrder = [];

			_.each(data, function(value, key){
				report.tableOrder.push(key);
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
				report.tableOrder = data.keys;
			else
				report.tableOrder = [
		            'Date'
		          , 'Comments Submitted'
		          , 'Comments Approved'
		          , 'Comment Approval Rate'
		          , 'Average Word Count'
		          , 'Photos Submitted'
		          , 'Photos Approved'
		          , 'Photo Approval Rate'
		          , 'Likes'
		        ];

			formattedData.Total = data.Total;
			return formattedData;
		}

    this.setDateResolution = function GCsetDateResolution(option) {
      assureString(option);
      FilterService.setPromoDateSort(option);
      $scope.report.updateGraph();
    };

    this.isSelectedDateSort = function GCisSelectedDateSort(option) {
      return option === FilterService.getDateSort();
    };

    function assureString(option) {
      if (!angular.isString(option)) {
        throw new Error('not a string');
      }
    }

		$scope.ReportingController = this;
		return $scope.ReportingController;
  }]);
