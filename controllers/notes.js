altriaMap.controller('NotesController', [
     '$scope'
    , '$rootScope'
    , '$filter'
    , 'FilterService'
    , 'RequestService'
    , 'ngDialog'
    , 'Utility'
    ,
		function ($scope, $rootScope, $filter, FilterService, RequestService, ngDialog, Utility) {

		var notes = this;
		var unregister;

		this.sortBy = "created";
		this.sortAscending = [];
		this.sortAscending["created"] = false;

		this.currentPage = 1;
		this.pagingBusy = false;

		function constructObj(key, title, data) {
			return {
				title: title,
				data: data,
				getter: key
			};
		}

		this.updateNotes = function () {
			notes.currentPage = 1;
			notes.pagingBusy = false;
			notes.returnedNotes = FilterService.displayNoteData();

		}


		function initialize() {
			RequestService
				.data('note')
				.then(function POCinit(info) {
					FilterService.setNoteData(info.data.docs);
					notes.updateNotes();
				})

			$scope.report.reportFuncCtrl.download = function(elem){

				var tableElem,
					infoObj;

				tableElem = $('.desktop table');

				infoObj = {
					filename: 'UGC_'+ notes.getTableTitle().toUpperCase() + '_'+ notes.getTableTimePeriod().toUpperCase() +'_Notes.csv',
					title: notes.getTableTitle(),
					subtitle: notes.getTableTimePeriod(),
					reportSuite: 'Community',
          brand: $filter('deslug')($rootScope.$stateParams.brand)
				}

				Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
			}

		}


		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:update', function () {
			notes.updateNotes();
		});

		$scope.$on('$destroy', unregister);




		this.openAddNoteModal = function (noteInfo) {
			notes.selectedNote = noteInfo;
			ngDialog.open({
				template: '_res/views/_modalAddNote.html',
				className: 'add-note-modal',
				controller: 'AddNoteModalController',
				scope: $scope
			});
		};

		this.paging = function(){


			if(!notes.pagingBusy){

				var dataObj = {
					pageNum: ++notes.currentPage,
					amtPerPage: 25
				};

			notes.pagingBusy = true;

			RequestService.data("note-paging", dataObj)
				.then(function (info) {

					var tempResults = info.data.docs;

					notes.returnedNotes = notes.returnedNotes.concat(tempResults);

					if(tempResults.length){
						notes.pagingBusy = false;
					}

				});
			}
		}

		this.getTableTitle = function(){

			if(FilterService.getCommunitySelectType() !== 'single-community'){

				return $filter('deslug')(FilterService.displayMultiCommunitySelect());

			} else {

				return $filter('deslug')(FilterService.displaySingleCommunitySelect());

			}
		}

		this.getTableTimePeriod = function(){

			var copy = "";

			if(FilterService.getTimePeriodType() === "time-period"){

				copy += FilterService.displayTimePeriod().label.toUpperCase();

			} else {

				copy += $filter('date')(FilterService.displayTimePeriod()[0], "MM/dd/yyyy" , 'UTC') +
						" - " +
						$filter('date')(FilterService.displayTimePeriod()[1], "MM/dd/yyyy" , 'UTC');

			}

			return copy;

		}

		this.sortHandler = function(sortOn, evt){

			notes.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				notes.sortAscending[sortOn]=!notes.sortAscending[sortOn];
			} else {
				notes.sortAscending[sortOn]=true;
			}
		}

		initialize();

		$scope.NotesController = this;
		return $scope.NotesController;

	  }]);
