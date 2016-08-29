altriaMap.controller('AddEmailNoteModalController', [
     '$scope'
    ,'$http'
    ,'$filter'
    ,'$interval'
    ,'ngDialog'
    ,'RequestService'
    ,'FilterService'
    ,'Session'
    ,'Utility'
    //,'AddNote'
    , function(
        $scope
      , $http
      , $filter
      , $interval
      , ngDialog
      , RequestService
      , FilterService
      , Session
      , Utility
      /*, AddNote*/ ) {

			var noteModal = this;
      this.multiEmailCheckboxVals = [];
      this.checkedEmailDisplay = "";

			this.next = function () {
				ngDialog.close('ngdialog1');
			};

			this.submitAddNote = function () {

        RequestService
          .data('user-info', Session.getSession().userId )
          .then( function userInfoResp(userInfo){

            var dataObj = {};
            dataObj.userId = Session.getSession().userId || 86 ;
            dataObj.brandId = FilterService.getBrand();
            dataObj.created = Date.now();
            dataObj.note = noteModal.stagedNote.note;
            dataObj.type = "email";
            dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';
            dataObj.communityLinks = noteModal.checkedEmailDisplay.length ? noteModal.checkedEmailDisplay.split(", ") : (noteModal.selectedEmail.constructor === Array ? noteModal.selectedEmail : [noteModal.selectedEmail]);

            if(userInfo){
              dataObj.firstName = userInfo.data.first_name;
              dataObj.lastName = userInfo.data.last_name;
            }

            RequestService
              .data("addEmailNote", dataObj, noteModal.stagedNote.image)
              .then(function addNoteResp(info){
                noteModal.closeAndUpdate();
              });
          });
			};

      function updateScope(){
        noteModal.emailSelectType      = FilterService.getEmailSelectType();
        noteModal.multiCommunitySelectOpen = FilterService.getModalMultiCommunitySelectOpen();

        if(noteModal.emailSelectType === 'single-email'){
          noteModal.singleCommunitySelect  = FilterService.displayModalSingleCommunitySelect();
        } else if(noteModal.emailSelectType === 'multi-email'){
          noteModal.multiCommunitySelect   = FilterService.displayModalMultiCommunitySelect();
        }

        noteModal.setMultiEmailCheckbox();
      }

      this.submitUpdateNote = function(){

        var dataObj = {};
        dataObj.id = noteModal.stagedNote.id;
        dataObj.brandId = FilterService.getBrand();
        dataObj.note = noteModal.stagedNote.note;
        dataObj.created = noteModal.stagedNote.created;
        dataObj.communityLinks = noteModal.checkedEmailDisplay.length ? noteModal.checkedEmailDisplay.split(", ") : (noteModal.selectedEmail.constructor === Array ? noteModal.selectedEmail : [noteModal.selectedEmail]);
        dataObj.type = "email";
        //dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';

        if(noteModal.stagedNote.image) dataObj.fileUrl = noteModal.stagedNote.image.name;

        dataObj.firstName = noteModal.stagedNote.name_first;
        dataObj.lastName = noteModal.stagedNote.name_last;


        RequestService
          .data("updateEmailNote", dataObj, noteModal.stagedNote.image)
          .then(function updateNoteResp(info) {
            noteModal.closeAndUpdate();
          });

			};

			this.submitDeleteNote = function () {

				var dataObj = {};
				dataObj.id = $scope.notes.selectedNote.id;

				RequestService
					.data("deleteEmailNote", dataObj)
					.then(function deleteNoteResp(info) {
						noteModal.closeAndUpdate();
					});
			};

			this.fileNameChanged = function (element) {
				//console.log("select file: " + element.files[0]);
				noteModal.stagedNote.image = element.files[0];
			}

      this.setEmailModalEmail = function (email){

        FilterService.setEmailModalEmailSelect(email);
        updateScope();
      };

      this.openMultiSelect  = function () {
        FilterService.setModalMultiCommunitySelectOpen(true);
        updateScope();
        //debug('ANMCopenMultiSelect', true);
      };

      this.closeMultiSelect = function () {
        FilterService.setModalMultiCommunitySelectOpen(false);
        updateScope();
        //debug('ANMCcloseMultiSelect', false);
      };

      this.getSelectedMultiEmails = function ()
      {
        var str = '',
            _temp_arr = [],
            _checkedEmails = FilterService.displayEmailModalEmailSelect();

        for(var i=0; i < $scope.compareEmails.selectedEmailList.length; i++)
        {
          _temp_arr[i] = $scope.compareEmails.selectedEmailList[i]['Email Name'];
        }

        return _checkedEmails; //Utility.truncateString(str, 38);

      };

      this.setMultiEmailCheckbox = function(evt){

        $.grep(Object.keys(noteModal.multiEmailCheckboxVals), function(v, k){
          if (noteModal.multiEmailCheckboxVals[v])
            return true;
          else
            delete noteModal.multiEmailCheckboxVals[v]

          return false;

        })

        noteModal.checkedEmailDisplay = Object.keys(noteModal.multiEmailCheckboxVals).join(", ");
      }


			this.closeAndUpdate = function () {

				$(".submit").addClass("submitting-note")
					.html("Submitting");

        $interval(function() {
          $scope.EmailNotesController.updateNotes();
          $scope.closeThisDialog();
        }, 1000, 1);

      }

    this.initialize = function(){

      noteModal.stagedNote = {};
      noteModal.emailSelectType = FilterService.getEmailSelectType();

      if( noteModal.emailSelectType === "single-email" ) {

        noteModal.emails = $scope.emailSingle.emailList.map(function (obj) {
          return obj.id;
        });
        noteModal.selectedEmail = $scope.emailSingle.selectedEmail;

      } else if( noteModal.emailSelectType === "multi-email" ) {

        noteModal.emails = $scope.compareEmails.emailList.map(function (obj) {
          return obj.id;
        });

        noteModal.selectedEmail = $scope.compareEmails.selectedEmailList.map(function (obj) {
          return obj.id;
        });

        for( var i=0; i < noteModal.selectedEmail.length; i++)
        {
          noteModal.multiEmailCheckboxVals[noteModal.selectedEmail[i]] = true;
        }
      }

       //noteModal.singleCommunitySelect = $scope.report.singleCommunitySelect


      // noteModal.communitySelectType = $scope.report.communitySelectType;
       //noteModal.filterOptions       = $scope.report.filterOptions;
       //noteModal.multiCommunitySelectOpen = $scope.report.multiCommunitySelectOpen;
       //noteModal.multiCommunitySelect = $scope.report.multiCommunitySelect;*/

      noteModal.showDelete = Session.getSession().delete_notes === 'true';

      if($scope.notes.selectedNote){

        $('#attach-file').val($scope.notes.selectedNote.fileUrl);
        noteModal.stagedNote = angular.copy($scope.notes.selectedNote);

      } else if($scope.report) {

        /*this.setCommunitySelectType($scope.report.communitySelectType);

         if(this.communitySelectType === 'single-community'){

         this.setSingleCommunity($scope.report.singleCommunitySelect);

         }else if(this.communitySelectType === 'multi-community'){

         this.setMultiCommunity($scope.report.multiCommunitySelect);

         }*/
      }

      updateScope();
    }();

			$scope.AddNoteModalController = this;
			return $scope.AddNoteModalController;
	}
	]);
