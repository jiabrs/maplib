altriaMap.factory('AuthService', ['$http', '$rootScope', '$state', '$location','ngDialog', 'Session', '$q',
	function ($http, $rootScope, $state, $location, ngDialog, Session, $q) {
		var authService = {};
		var mockLogin = false;

		authService.login = function (credentials) {
			if (mockLogin) {
				$state.go('app.main');
			} else {
				return $http
					.post('/user/sign_out', credentials)
					.then(function (response) {
						Session.create(response.data);
						return response.data;
					});
			}
		};


    authService.getOktaAuthentication = function () {
      // <BYPASS CODE>
      if (authService.getParameterByName('bypass') == 'true') {
        var userObj = {
          brands: [
            "l-m",
            "marlboro",
            "parliament",
            "virginia-slims",
            "black-mild",
            "copenhagen",
            "red-seal",
            "skoal"
          ],
          delete_notes: true,
          id: 8,
          success: true,
          username: "bypass"
        }
        Session.create(userObj);
      } else {
        // </BYPASS CODE>
        $http
          .post('/user/auth')
          .then(function (response) {
            if (response.data.success) {
              Session.create(response.data);
            } else {
              Session.clear();
            }
        });
      };
    }


    authService.oktaAuthSyncCall = function(){
      // perform some asynchronous operation, resolve or reject the promise when appropriate.
      return $q(function(resolve, reject) {
        setTimeout(function() {
          if (authService.getOktaAuthentication()) {
            resolve();
          } else {
            reject();
          }
        }, 2000);
      });
    }


		authService.logout = function () {
      var credentials = {
        username: Session.getSession().username
      };



      $http.delete('/users/sign_out').
        success(function(data, status, headers, config) {
          ngDialog.closeAll();
          Session.clear();
          window.location.assign('https://leoconnect.okta.com/login/signout')
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert('Error logging out: ' +  data.message)
        });



    };

    authService.updatePassword = function (credentials) {
      return $http
        .put('/users/password', credentials)
        .then(function(response) {
          return response.data;
        });
    };



		authService.isAuthenticated = function () {
			return Session.getSession().username || false;
		};

		authService.isAuthorized = function (brandParam) {
			var authorizedRoles = Session.getSession().brands;

			if (!angular.isArray(authorizedRoles)) {
				authorizedRoles = authorizedRoles.split(',');
			}
			return (authorizedRoles.indexOf(brandParam) !== -1);
		};

    authService.getParameterByName = function(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

		return authService;

  }]);
