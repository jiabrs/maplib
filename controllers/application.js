altriaMap.controller('ApplicationController', [
    '$scope'
  , '$rootScope'
  , '$state'
  , '$location'
  , '$anchorScroll'
  , 'AuthService'
  , function (
		  $scope
    , $rootScope
    , $state
    , $location
    , $anchorScroll
    , AuthService) {

		var app = this;

		app.currentUser = null;
		app.authorizedBrands = null;
		app.isAuthorized = AuthService.isAuthorized;

		$scope.setCurrentUser = function (user) {
			app.currentUser = user;
		};

		$scope.setAuthorizedBrands = function (brands) {
			app.authorizedBrands = brands;
		};

		app.logout = function () {
			app.currentUser = null;
			app.authorizedBrands = null;
			AuthService.logout();
		};

    app.toTop = function() {
      $anchorScroll();
    };

    $rootScope.$on('not-authenticated', function () {
			$state.go('login');
		});


    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {
        $('.to-top').fadeIn();
      } else {
        $('.to-top').fadeOut();
      }
    });

		$scope.ApplicationController = this;
		return $scope.ApplicationConroller;

}]);
