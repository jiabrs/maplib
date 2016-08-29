altriaMap.controller('AddPromoNoteModalController', [
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
      this.multiPromoCheckboxVals = [];
      this.checkedPromoDisplay = "";
      //this.dateCreated = Date.now();

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
            dataObj.created = noteModal.stagedNote.created;
            dataObj.note = noteModal.stagedNote.note;
            dataObj.type = "promotion";
            dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';
            dataObj.communityLinks = noteModal.checkedPromoDisplay.length ? noteModal.checkedPromoDisplay.split(", ") : (noteModal.selectedPromo.constructor === Array ? noteModal.selectedPromo : [noteModal.selectedPromo]);

            if(userInfo){
              dataObj.firstName = userInfo.data.first_name;
              dataObj.lastName = userInfo.data.last_name;
            }

            RequestService
              .data("addPromoNote", dataObj, noteModal.stagedNote.image)
              .then(function addNoteResp(info){
                noteModal.closeAndUpdate();
              });
          });
			};

      function updateScope(){
        noteModal.promotionSelectType      = FilterService.getPromoSelectType();
        noteModal.multiCommunitySelectOpen = FilterService.getModalMultiCommunitySelectOpen();

        if(noteModal.promotionSelectType === 'single-promo'){
          noteModal.singleCommunitySelect  = FilterService.displayModalSingleCommunitySelect();
        } else if(noteModal.promotionSelectType === 'multi-promo'){
          noteModal.multiCommunitySelect   = FilterService.displayModalMultiCommunitySelect();
        }

        noteModal.setMultiPromoCheckbox();
      }

      this.submitUpdateNote = function(){

        var dataObj = {};
        dataObj.id = noteModal.stagedNote.id;
        dataObj.brandId = FilterService.getBrand();
        dataObj.note = noteModal.stagedNote.note;
        dataObj.created = noteModal.stagedNote.created;
        dataObj.communityLinks = noteModal.checkedPromoDisplay.length ? noteModal.checkedPromoDisplay.split(", ") : (noteModal.selectedPromo.constructor === Array ? noteModal.selectedPromo : [noteModal.selectedPromo]);
        dataObj.type = "promotion";
        //dataObj.fileUrl = noteModal.stagedNote.image ? noteModal.stagedNote.image.name : '';

        if(noteModal.stagedNote.image) dataObj.fileUrl = noteModal.stagedNote.image.name;

        dataObj.firstName = noteModal.stagedNote.name_first;
        dataObj.lastName = noteModal.stagedNote.name_last;


        RequestService
          .data("updatePromoNote", dataObj, noteModal.stagedNote.image)
          .then(function updateNoteResp(info) {
            noteModal.closeAndUpdate();
          });

			};

			this.submitDeleteNote = function () {

				var dataObj = {};
				dataObj.id = $scope.notes.selectedNote.id;

				RequestService
					.data("deletePromoNote", dataObj)
					.then(function deleteNoteResp(info) {
						noteModal.closeAndUpdate();
					});
			};

			this.fileNameChanged = function (element) {
				//console.log("select file: " + element.files[0]);
				noteModal.stagedNote.image = element.files[0];
			}

      this.setPromoModalPromo = function (promotion){

        FilterService.setPromoModalPromoSelect(promotion);
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

      this.getSelectedMultiPromos = function ()
      {
        var str = '',
            _temp_arr = [],
            _checkedPromos = FilterService.displayPromoModalPromoSelect();

        for(var i=0; i < $scope.comparePromos.selectedPromoList.length; i++)
        {
          _temp_arr[i] = $scope.comparePromos.selectedPromoList[i]['Promo Name'];
        }

        return _checkedPromos; //Utility.truncateString(str, 38);

      };

      this.setMultiPromoCheckbox = function(evt){

        $.grep(Object.keys(noteModal.multiPromoCheckboxVals), function(v, k){
          if (noteModal.multiPromoCheckboxVals[v])
            return true;
          else
            delete noteModal.multiPromoCheckboxVals[v]

          return false;

        })

        noteModal.checkedPromoDisplay = Object.keys(noteModal.multiPromoCheckboxVals).join(", ");
      }


			this.closeAndUpdate = function () {

				$(".submit").addClass("submitting-note")
					.html("Submitting");

        $interval(function() {
          $scope.PromoNotesController.updateNotes();
          $scope.closeThisDialog();
        }, 1000, 1);

      }

    this.initialize = function(){

      noteModal.stagedNote = {};
      noteModal.promotionSelectType = FilterService.getPromoSelectType();

      if( noteModal.promotionSelectType === "single-promo" ) {

        noteModal.promotions = $scope.singlePromo.promoList.map(function (obj) {
          return obj.id;
        });
        noteModal.selectedPromo = $scope.singlePromo.selectedPromo;

      } else if( noteModal.promotionSelectType === "multi-promo" ) {

        noteModal.promotions = $scope.comparePromos.promoList.map(function (obj) {
          return obj.id;
        });

        noteModal.selectedPromo = $scope.comparePromos.selectedPromoList.map(function (obj) {
          return obj.id;
        });

        for( var i=0; i < noteModal.selectedPromo.length; i++)
        {
          noteModal.multiPromoCheckboxVals[noteModal.selectedPromo[i]] = true;
        }
      }

      noteModal.dateOptionsCreated =  {
        minDate: '-5y',
        maxDate: function () {
          return (noteModal.dateCreated) ? noteModal.dateCreated : 0;
        }()
        //maxDate: 0,
      };
       //noteModal.singleCommunitySelect = $scope.report.singleCommunitySelect


      // noteModal.communitySelectType = $scope.report.communitySelectType;
       //noteModal.filterOptions       = $scope.report.filterOptions;
       //noteModal.multiCommunitySelectOpen = $scope.report.multiCommunitySelectOpen;
       //noteModal.multiCommunitySelect = $scope.report.multiCommunitySelect;*/

      noteModal.showDelete = Session.getSession().delete_notes === 'true';
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
