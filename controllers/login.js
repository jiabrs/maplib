altriaMap.controller('LoginController', [
    '$scope'
  , '$rootScope'
  , '$state'
  , 'AUTH_EVENTS'
  , 'AuthService'
  , 'UserService'
  , 'Session'
  , function (
		  $scope
    , $rootScope
    , $state
    , AUTH_EVENTS
    , AuthService
    , UserService
    , Session) {

		var login = this;



    $rootScope.brandClass = "default";
    $rootScope.layoutClass = "login";

    login.credentials = {
      username: '',
      password: ''
    };

    if (UserService.restoreState()) {
      login.credentials.username = UserService.restoreState();
      login.rememberUsername = true;
    } else {
      login.rememberUsername = false;
    }

		this.saveUsername = function () {
			if (login.credentials.username && login.rememberUsername) {
				UserService.saveState(login.credentials.username);
			} else if (login.credentials.username && !login.remeberUsername) {
				UserService.saveState('');
			}
		};






    this.ConfirmAuth = function () {
      AuthService.getOktaAuthentication().then(function (data) {
        login.data = data;
        if (data.success) {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        } else {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
      }, function (data) {
        login.data = data;
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };

		$rootScope.$on('login-success', function () {
			$scope.setCurrentUser(login.data.username);
			$scope.setAuthorizedBrands(login.data.brands);
			Session.create(login.data);
      if (login.data.requirePasswordUpdate) {
        $state.go('app.updatepassword');
      } else {
        $state.go('app.main');
      }
		});

		$scope.LoginController = this;
		return $scope.LoginController;

}]);
