altriaMap.controller('UpdatePasswordController', [
    '$scope'
  , '$rootScope'
  , '$state'
  , 'AUTH_EVENTS'
  , 'AuthService'
  , 'Session'
  , function(
      $scope
    , $rootScope
    , $state
    , AUTH_EVENTS
    , AuthService
    , Session) {

    var updatePassword = this;

    $rootScope.brandClass = "default";
    $rootScope.layoutClass = "login update-password";

    updatePassword.credentials = {
      username: '',
      password: '',
      password_confirmation: ''
    };

    updatePassword.credentials.username = Session.getSession().username;

    this.submitPassword = function(credentials) {
      AuthService.updatePassword(credentials).then(function(data) {
        updatePassword.data = data;
        if (data.success) {
          $rootScope.$broadcast(AUTH_EVENTS.updatePasswordSuccess);
        } else {
          $rootScope.$broadcast(AUTH_EVENTS.updatePasswordFailed);
        }
      }, function (data) {
        updatePassword.data = data;
        $rootScope.$broadcast(AUTH_EVENTS.updatePasswordFailed);
      });
    };

    $rootScope.$on('update-password-success', function () {
      $state.go('app.main');
    });

    $scope.UpdatePasswordContoller = this;
    return $scope.UpdatePasswordContoller;

  }]);
