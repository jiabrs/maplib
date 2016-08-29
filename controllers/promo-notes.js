altriaMap.controller('PromoNotesController', [
	 '$scope'
	, '$rootScope'
	, '$filter'
	, 'FilterService'
	, 'RequestService'
	, 'ngDialog'
	, 'Utility'
	,
		function ($scope, $rootScope, $filter, FilterService, RequestService, ngDialog, Utility) {

		var promoNotes = this;
		var unregister;

		this.sortBy = "created";
		this.sortAscending = [];
		this.sortAscending["created"] = false;
		this.currentPage = 1;
		this.pagingBusy = false;
		this.selectedPromo = "";

		function constructObj(key, title, data) {
			return {
				title: title,
				data: data,
				getter: key
			};
		}

		this.updateNotes = function () {
			promoNotes.currentPage = 1;
			promoNotes.pagingBusy = false;

			var dataObj = {
				promoName: promoNotes.selectedPromo = FilterService.getPromoSelectType() === "single-promo" ?  FilterService.getSelectedPromo() : FilterService.displayPromoMultiSelect()
			}

			RequestService
				.data('promotion-notes', dataObj)
				.then(function POCinit(info) {
					FilterService.setPromoNoteData(info.data.docs);
					promoNotes.returnedNotes = FilterService.displayPromoNoteData();
				})
		}

		this.initialize = function () {

			promoNotes.updateNotes();

      if( FilterService.getPromoSelectType() === "single-promo" ){

        $scope.singlePromo.reportFuncCtrl.download = function(elem){

          var tableElem,
            infoObj;

          tableElem = $('.notes.desktop table');

          infoObj = {
            filename: 'Promotions_'+ promoNotes.getTableTitle().toUpperCase() + '_'+ promoNotes.getTableTimePeriod().toUpperCase() +'_Notes.csv',
            title: promoNotes.getTableTitle(),
            subtitle: promoNotes.getTableTimePeriod(),
            reportSuite: 'Promotion',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
          }

          Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
        }
      } else if( FilterService.getPromoSelectType() === "multi-promo"){

        $scope.comparePromos.reportFuncCtrl.download = function(elem){

          var tableElem,
            infoObj;

          tableElem = $('.notes.desktop table');

          infoObj = {
            filename: 'Promotions_'+ promoNotes.getTableTitle().toUpperCase() + '_'+ promoNotes.getTableTimePeriod().toUpperCase() +'_Notes.csv',
            title: promoNotes.getTableTitle(),
            subtitle: promoNotes.getTableTimePeriod(),
            reportSuite: 'Promotion',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
          }

          Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
        }

      }

		}();


		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:selectedPromo:update', function () {
			promoNotes.updateNotes();
		});

		$scope.$on('$destroy', unregister);

		this.openAddNoteModal = function (noteInfo) {
			promoNotes.selectedNote = noteInfo;
			ngDialog.open({
				template: '_res/views/_modalAddPromoNote.html',
				className: 'add-note-modal',
				controller: 'AddPromoNoteModalController',
				scope: $scope
			});
		};

		this.paging = function(){


			if(!promoNotes.pagingBusy){

				var dataObj = {
					promoName: FilterService.getSelectedPromo(),
					pageNum: ++promoNotes.currentPage,
					amtPerPage: 25
				};

			promoNotes.pagingBusy = true;

			RequestService.data("promo-note-paging", dataObj)
				.then(function (info) {

					var tempResults = info.data.docs;

					promoNotes.returnedNotes = promoNotes.returnedNotes.concat(tempResults);

					if(tempResults.length){
						promoNotes.pagingBusy = false;
					}

				});
			}
		}

		this.getTableTitle = function(){

			return $filter('deslug')(FilterService.getSelectedPromo());

		}

		this.getTableTimePeriod = function(){

			return FilterService.displayPromoQtrTimePeriod();

		}

		this.sortHandler = function(sortOn, evt){

			promoNotes.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				promoNotes.sortAscending[sortOn]=!promoNotes.sortAscending[sortOn];
			} else {
				promoNotes.sortAscending[sortOn]=true;
			}
		}

		$scope.PromoNotesController = this;
		return $scope.PromoNotesController;

}]);
