altriaMap.controller('AddNoteModalController', [
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
            dataObj.created = noteModal.stagedNote.created || Date.now();
            dataObj.note = noteModal.stagedNote.note;


            if(userInfo){
              dataObj.firstName = userInfo.data.first_name;
              dataObj.lastName = userInfo.data.last_name;
            }

            var communitySelect = FilterService.getModalCommunitySelectType();

            if(communitySelect === "single-community"){

              dataObj.communityLinks = FilterService.displayModalSingleCommunitySelect() === 'all' ? $filter('slug')(noteModal.communities) : [$filter('slug')(FilterService.getModalSingleCommunitySelect())];


            } else if (communitySelect === "multi-community"){

              dataObj.communityLinks = FilterService.displayModalMultiCommunitySelect().split(',');
              FilterService.setModalMultiCommunitySelect(dataObj.communityLinks);
            }

            dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';

            RequestService
              .data("addNote", dataObj, noteModal.stagedNote.image)
              .then(function addNoteResp(info){
                noteModal.closeAndUpdate();
              });
          });
			};

      function updateScope(){
        noteModal.communitySelectType      = FilterService.getModalCommunitySelectType();
        noteModal.multiCommunitySelectOpen = FilterService.getModalMultiCommunitySelectOpen();

        if(noteModal.communitySelectType === 'single-community'){
          noteModal.singleCommunitySelect  = FilterService.displayModalSingleCommunitySelect();
        } else if(noteModal.communitySelectType === 'multi-community'){
          noteModal.multiCommunitySelect   = FilterService.displayModalMultiCommunitySelect();
        }
      }

      this.submitUpdateNote = function(){

        var dataObj = {};
        dataObj.userId = noteModal.stagedNote.userId;
        dataObj.brandId = FilterService.getBrand();
        dataObj.created = noteModal.stagedNote.created;
        dataObj.note = noteModal.stagedNote.note;
        dataObj.id = noteModal.stagedNote.id;

        var communitySelect = FilterService.getModalCommunitySelectType();

        if(communitySelect === "single-community"){

          dataObj.communityLinks = FilterService.displayModalSingleCommunitySelect() === 'all' ? $filter('slug')(noteModal.communities) : [$filter('slug')(FilterService.getModalSingleCommunitySelect())];

        } else if (communitySelect === "multi-community"){

          dataObj.communityLinks = FilterService.displayModalMultiCommunitySelect();
          FilterService.setModalMultiCommunitySelect(dataObj.communityLinks);
        }

          dataObj.firstName = noteModal.stagedNote.name_first;
          dataObj.lastName = noteModal.stagedNote.name_last;


    //dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';

        if(noteModal.stagedNote.image) dataObj.fileUrl = noteModal.stagedNote.image.name;

        RequestService
          .data("updateNote", dataObj, noteModal.stagedNote.image)
          .then(function updateNoteResp(info) {
            noteModal.closeAndUpdate();
          });
			};

			this.submitDeleteNote = function () {

				var dataObj = {};
				dataObj.id = $scope.notes.selectedNote.id;

				RequestService
					.data("deleteNote", dataObj)
					.then(function deleteNoteResp(info) {
						noteModal.closeAndUpdate();
					});
			};

			this.fileNameChanged = function (element) {
				//console.log("select file: " + element.files[0]);
				noteModal.stagedNote.image = element.files[0];
			}

      this.setSingleCommunity = function (community){


        FilterService.setModalSingleCommunitySelect(community);


        //noteModal.singleCommunitySelect = community;
        updateScope();
        //debug('ANMCsetCom', community);
      };

      this.setMultiCommunity = function (community){
        FilterService.setModalMultiCommunitySelect(community);
        updateScope();
        //debug('ANMCsetCom', community);
      };

			this.getSelectedMultiCommunities = function () {
				var str = FilterService.displayModalMultiCommunitySelect().toString();
				return Utility.truncateString(str, 38);

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

      this.setMultiCommunityCheckbox = function (community){
        var multiArr = [];
        var multiStr = '';
        _.each(noteModal.multiComCheckboxVals, function(v,i){
          if(noteModal.multiComCheckboxVals[i] === true){
            var str = Utility.transformStringToParameter(noteModal.communities[i]);
            multiArr.push(str);
            multiStr = multiStr + str;
          }
        });
        FilterService.setModalMultiCommunitySelect(multiArr);
        updateScope();

			};

			this.setCommunitySelectType = function (communitySelectType) {

				this.communitySelectType = communitySelectType;

				FilterService.setModalCommunitySelectType(communitySelectType);
				//debug('ANMCsetCommuntitySelectType', communitySelectType);
			};

			this.closeAndUpdate = function () {

				$(".submit").addClass("submitting-note")
					.html("Submitting");

        $interval(function() {
          $scope.ReportingController.updateNotes();
          $scope.closeThisDialog();
        }, 1000, 1);

      }

    this.initialize = function(){

      noteModal.stagedNote = {};

      noteModal.communities = $scope.report.communities
      noteModal.singleCommunitySelect = $scope.report.singleCommunitySelect
      noteModal.multiComCheckboxVals = _.map($scope.report.multiComCheckboxVals, function(v, i){
        return Utility.transformStringToParameter(v);
      });

      noteModal.communitySelectType = $scope.report.communitySelectType;
      noteModal.filterOptions       = $scope.report.filterOptions;
      noteModal.multiCommunitySelectOpen = $scope.report.multiCommunitySelectOpen;
      noteModal.multiCommunitySelect = $scope.report.multiCommunitySelect;

      noteModal.showDelete = Session.getSession().delete_notes === 'true';

      noteModal.dateOptionsCreated =  {
        minDate: '-5y',
        maxDate: 0
      };

      noteModal.stagedNote.created = new Date().toLocaleDateString();

      if($scope.notes.selectedNote){

        $('#attach-file').val($scope.notes.selectedNote.fileUrl);
        noteModal.stagedNote = angular.copy($scope.notes.selectedNote);

        if(noteModal.stagedNote.created){
            noteModal.stagedNote.created = new Date(noteModal.stagedNote.created).toLocaleDateString();
          }
          else{
            noteModal.stagedNote.created = new Date().toLocaleDateString();
          }

          noteModal.stagedNote.created = noteModal.stagedNote.created.toString();

        if($scope.notes.selectedNote.communityLinks.length <= 1){

          noteModal.setCommunitySelectType('single-community');
          noteModal.setSingleCommunity($filter('deslug')($scope.notes.selectedNote.communityLinks[0]));

        } else {

          noteModal.setCommunitySelectType('multi-community');
          noteModal.setMultiCommunity($scope.notes.selectedNote.communityLinks.toString());

          noteModal.multiComCheckboxVals = _.map($scope.notes.selectedNote.communityLinks, function(v, i){
            return Utility.transformStringToParameter(v);
          });

        }

      } else if($scope.report) {

        noteModal.setCommunitySelectType($scope.report.communitySelectType);

        if(noteModal.communitySelectType === 'single-community'){

          noteModal.setSingleCommunity($scope.report.singleCommunitySelect);

        }else if(noteModal.communitySelectType === 'multi-community'){

          noteModal.setMultiCommunity($scope.report.multiCommunitySelect);

        }
      }

      updateScope();

    }();

			$scope.AddNoteModalController = this;
			return $scope.AddNoteModalController;
	}
	]);
