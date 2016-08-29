altriaMap.factory('UserService', ['$rootScope',
		function ($rootScope) {

		var userService = this;
		userService.preferences = {
			username: ''
		};

    this.saveState = function(username) {
			if (username != '') {
				localStorage.setItem('username', username);
			} else {
				localStorage.removeItem('username');
			}
		};

		this.restoreState = function() {
			var username = localStorage.getItem('username');
			return username;
		};

		$rootScope.$on("savestate", userService.SaveState);
		$rootScope.$on("restorestate", userService.RestoreState);

		return userService;
  }]);
