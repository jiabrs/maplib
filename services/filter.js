altriaMap.service('FilterService', [
    'Utility'
    , '$rootScope'
    ,
		function (Utility, $rootScope) {
		var community = this;
		var initialize = (function FSinitialize() {
			return function FSinitReturnFunction() {

				var closure = {
					  communitySelectType: 'single-community'
					, timePeriodType: 'time-period'
					, timePeriod: {label:"Year To Date",value:'ytd'}
					, expandedTimePeriod : ''
					, singleCommunitySelect: 'all'
					, multiCommunitySelect: []
					, multiCommunitySelectOpen : false
					, showExpandedNotes : false
					, showAddNoteModal : false
					, chartData : {}
					, chartTitles: {}
					, noteData : {}
					, searchResults : {}
					, brand: 'marlboro'
					, contentType : 'ugc'
					, graphFilters : {}
					, primaryGraphFilter: 'Comments Submitted'
					, secondaryGraphFilter: 'Comment Approval Rate'
					, dateSort: 'Month'
					, modalCommunitySelectType : 'single-community'
					, modalSingleCommunitySelect: ''
					, modalMultiCommunitySelect: []
					, modalMultiCommunitySelectOpen : false
					, searchSingleCommunitySelect: ''
					, searchTimePeriodType : 'time-period'
					, searchTimePeriod : {label:"Year To Date",value:'ytd'}
					, promoFilters : {}
					, selectedPromo : ''
					, promoSelectType : 'single-promo'
					, promoMultiSelect : []
					, promoNoteData : {}
          , emailNoteData : {}
					, showPromoExpandedNotes : false
					, promoChartData : {}
					, promoChartTitles : {}
					, promoGraphFilters : {}
					, promoPrimaryGraphFilter : 'Total Entries'
					, promoSecondaryGraphFilter: '% Tablet/Mobile/SMS/MMS'
					, promoDateSort : 'Week'
					, promoTimePeriod : ''
					, promoQtrTimePeriod : ''
					, expandedPromoTimePeriod : ''
					, promoModalPromoSelect : ''
          , isNewPromoSelected : true

          , emailFilters : {}
          , selectedEmail : ''
          , emailSelectType : 'single-email'
          , emailMultiSelect : []
          , emailNoteData : {}
          , emailNoteData : {}
          , showEmailExpandedNotes : false
          , emailChartData : {}
          , emailChartTitles : {}
          , emailGraphFilters : {}
          , emailPrimaryGraphFilter : 'Total Entries'
          , emailSecondaryGraphFilter: '% Tablet/Mobile/SMS/MMS'
          , emailDateSort : 'Week'
          , emailTimePeriod : ''
          , emailQtrTimePeriod : ''
          , expandedEmailTimePeriod : ''
          , emailModalEmailSelect : ''
          , isNewEmailSelected : true
				},
				obj = {},
				keys = _.keys(closure);

				//for each key in closure, create getKey, setKey, and displayKey strings.
				_.each(keys, function FSinitGetSetDisplay(k) {
					var getter = "get" + Utility.capitalize(k),
						setter = "set" + Utility.capitalize(k),
						displayer = "display" + Utility.capitalize(k),
						_k = Utility.lowerize(k);

					community[displayer] = (function FSinitDisplayer() {
						return Utility.clone(closure[_k]);
					});

					community[getter] = (function FSinitGetter(override) {
						var str = closure[_k];
						var type = Utility.getType(str);


						//if(_k === "multiCommunitySelect")
							//console.log("multiCommunitySelect[getter]: "+str)

						if (type === 'array' && !override) {
							return Utility.transformArgumentsToParameter(str);
						} else if (type === 'undefined' || type === 'null') {
							throw new Error('attempting to get a property that is undefined or null.\nProperty was ' + _k + '\nValue was ' + type);
						} else if (_k === "selectedPromo") {
							return str;
						}
						return Utility.transformStringToParameter(str);

					});

					community[setter] = function FSinitSetter(data) {

            //determine whether new promos have been selected to terminate existing promotion requests
            switch (_k) {

              case "selectedPromo":
              case "promoMultiSelect":

                this.isNewPromoSelected = closure[_k] != data;

                break;

              case "selectedEmail":
              case "emailMultiSelect":

                this.isNewEmailSelected = closure[_k] != data;

                    break;
            }

						closure[_k] = data;

						/*if(_k === "multiCommunitySelect"){
							console.log("setMultiCommunitySelect:" + data)
						}*/

						switch (_k) {

              case "selectedPromo":
              case "promoMultiSelect":

                $rootScope.$broadcast('DataService:selectedPromo:update');

                break;

              case "selectedEmail":
              case "emailMultiSelect":

                $rootScope.$broadcast('DataService:selectedEmail:update');

                break;

              case "multiCommunitySelect":

                //console.log("multiCommunitySelect[setter]: "+closure[_k]);

                break;

              //For filters that shouldn't send an event update
              case "communitySelectType":
              case "multiCommunitySelectOpen":
              case "expandedTimePeriod":
              case "expandedPromoTimePeriod":
              case "showExpandedNotes":



                break;

              case "chartData":

                $rootScope.$broadcast('DataService:chartData:update');

                break;

              default:

                $rootScope.$emit('DataService:update');

                break;

						}

					};
				});

				function returnFilterOptionType(type) {
					var _obj = {};
					_.each(keys, function FSfilterOptTypeEach(k) {
						var _getter = type + Utility.capitalize(k);
						_obj[k] = community[_getter]();
					});
					return _obj;
				}

				community.filterOptions = function FSfilteroptions() {
					return returnFilterOptionType('get');
				};

				community.displayOptions = function FSdisplayOptions() {
					return returnFilterOptionType('display');
				};
				return obj;
			};
		})();

		initialize();
    }]);
