altriaMap.controller('EmailNotesController', [
	 '$scope'
	, '$rootScope'
	, '$filter'
	, 'FilterService'
	, 'RequestService'
	, 'ngDialog'
	, 'Utility'
	,
		function ($scope, $rootScope, $filter, FilterService, RequestService, ngDialog, Utility) {

		var emailNotes = this;
		var unregister;

		this.sortBy = "created";
		this.sortAscending = [];
		this.sortAscending["created"] = false;
		this.currentPage = 1;
		this.pagingBusy = false;
		this.selectedEmail = "";

		function constructObj(key, title, data) {
			return {
				title: title,
				data: data,
				getter: key
			};
		}

		this.updateNotes = function () {
			emailNotes.currentPage = 1;
			emailNotes.pagingBusy = false;

			var dataObj = {
				emailName: emailNotes.selectedEmail = FilterService.getEmailSelectType() === "single-email" ?  FilterService.getSelectedEmail().Name : FilterService.displayEmailMultiSelect()
			}

			RequestService
				.data('email-notes', dataObj)
				.then(function POCinit(info) {
					FilterService.setEmailNoteData(info.data.docs);
					emailNotes.returnedNotes = FilterService.displayEmailNoteData();
				})
		}

		this.initialize = function () {

			emailNotes.updateNotes();

      if( FilterService.getEmailSelectType() === "single-email" ){

        $scope.emailSingle.reportFuncCtrl.download = function(elem){

          var tableElem,
            infoObj;

          tableElem = $('.notes.desktop table');

          infoObj = {
            filename: 'Emails_'+ emailNotes.getTableTitle().toUpperCase() + '_'+ emailNotes.getTableTimePeriod().toUpperCase() +'_Notes.csv',
            title: emailNotes.getTableTitle(),
            subtitle: emailNotes.getTableTimePeriod(),
            reportSuite: 'Email',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
          }

          Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
        }
      } else if( FilterService.getEmailSelectType() === "multi-email"){

        $scope.compareEmails.reportFuncCtrl.download = function(elem){

          var tableElem,
            infoObj;

          tableElem = $('.notes.desktop table');

          infoObj = {
            filename: 'Emails_'+ emailNotes.getTableTitle().toUpperCase() + '_'+ emailNotes.getTableTimePeriod().toUpperCase() +'_Notes.csv',
            title: emailNotes.getTableTitle(),
            subtitle: emailNotes.getTableTimePeriod(),
            reportSuite: 'Email',
            brand: $filter('deslug')($rootScope.$stateParams.brand)
          }

          Utility.exportTableToCSV.apply(elem, [tableElem, infoObj]);
        }

      }

		}();


		// listens for a setter to be called on FilterService.
		unregister = $rootScope.$on('DataService:selectedEmail:update', function () {
			emailNotes.updateNotes();
		});

		$scope.$on('$destroy', unregister);

		this.openAddNoteModal = function (noteInfo) {
			emailNotes.selectedNote = noteInfo;
			ngDialog.open({
				template: '_res/views/_modalAddEmailNote.html',
				className: 'add-note-modal',
				controller: 'AddEmailNoteModalController',
				scope: $scope
			});
		};

		this.paging = function(){


			if(!emailNotes.pagingBusy){

				var dataObj = {
					emailName: FilterService.getSelectedEmail(),
					pageNum: ++emailNotes.currentPage,
					amtPerPage: 25
				};

			emailNotes.pagingBusy = true;

			RequestService.data("email-note-paging", dataObj)
				.then(function (info) {

					var tempResults = info.data.docs;

					emailNotes.returnedNotes = emailNotes.returnedNotes.concat(tempResults);

					if(tempResults.length){
						emailNotes.pagingBusy = false;
					}

				});
			}
		}

		this.getTableTitle = function(){

			return $filter('deslug')(FilterService.getSelectedEmail());

		}

		this.getTableTimePeriod = function(){

			return FilterService.displayEmailQtrTimePeriod();

		}

		this.sortHandler = function(sortOn, evt){

			emailNotes.sortBy = sortOn;

			var $clickTarget = $(evt.currentTarget);

			if($clickTarget.hasClass("tableHeaderDown") || $clickTarget.hasClass("tableHeaderUp")){
				emailNotes.sortAscending[sortOn]=!emailNotes.sortAscending[sortOn];
			} else {
				emailNotes.sortAscending[sortOn]=true;
			}
		}

		$scope.EmailNotesController = this;
		return $scope.EmailNotesController;

}]);
