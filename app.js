var altriaMap = angular.module ('altriaMap', [
    'ui.router'
  , 'ui.date'
  , 'ngDialog'
  , 'ngIdle'
  , 'angular-loading-bar'
  , 'infinite-scroll'
  , 'angular-carousel'
  , 'ngTouch'
]);

// ROUTES
altriaMap.config([
    '$stateProvider'
  , '$urlRouterProvider'
  , '$locationProvider'
  , '$idleProvider'
  , function(
      $stateProvider
    , $urlRouterProvider
    , $locationProvider
    , $idleProvider) {

    $locationProvider.html5Mode(true);

    $idleProvider.idleDuration(30*60); // set Idle duration to 30 minutes

    $urlRouterProvider
      .when('/', ['$state', '$location', function($state, $location) {
        if(sessionStorage.getItem('username')) {
          if ($location.search().goto) {
            // if user attempts to directly access a URL (ie by directly typing it in or via a bookmark
            // Rails will redirect to Angular via a query string param
            // capture param and hand off to $location
            // strip Rails query string param from path before Angular starts route change
            newPath = $location.search().goto;
            $location.path(newPath).search('');
          } else {
            // if username is found in sessionStorage redirect to brand menu
            $state.go('app.main');
          }
        } else {
          // if username is not found in sessionStorage redirect to login
          $state.go('login');
        }
      }]);

    $stateProvider.state('app', {
      abstract: true,
      views: {
        'app': {}
      }
    }).state('notfound', {
      url: '/notfound',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/404.html'
        }
      }
    }).state('restricted', {
      url: '/restricted',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/403.html'
        }
      }
    }).state('login', {
      url: '/login',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/login.html'
        }
      }
    }).state('app.updatepassword', {
      url: '/updatepassword',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/updatePassword.html'
        }
      }
    }).state('app.main', {
      url: '/main',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/mainMenu.html'
        }
      }
    }).state('app.brandMenu', {
      url: '/:brand',
      parent: 'app',
      views: {
        'header': {
          templateUrl: '_res/views/_defaultHeader.html'
        },
        'main': {
          templateUrl: '_res/views/brandMenu.html'
        }
      }
    }).state('app.report', {
      url: '/:brand/:report',
      parent: 'app',
      views: {
        'header': {
          templateUrl: function($stateParams) {
            return '_res/views/' + $stateParams.report + '/_header.html'
          }
        },
        'main': {
          templateUrl: function($stateParams) {
            switch ($stateParams.report) {

              case 'ugc':
                $stateParams.reportState = "reporting";
                break;

              case 'promotions':
              case 'email':
                $stateParams.reportState = "single"
                break;
            }
            return '_res/views/' + $stateParams.report + '/' + $stateParams.reportState + '.html'
          }
        }
      }
    }).state('app.report.reportState', {
      url: '/:brand/:report/:reportState',
      parent: 'app',
      views: {
        'header': {
          templateUrl: function($stateParams) {
            return '_res/views/' + $stateParams.report + '/_header.html'
          }
        },
        'main': {
          templateUrl: function($stateParams) {
            return '_res/views/' + $stateParams.report + '/' + $stateParams.reportState + '.html'
          }
        }
      }
    });
}]);

altriaMap.run([
    '$rootScope'
  , '$location'
  , '$state'
  , '$stateParams'
  , '$idle'
  , '$anchorScroll'
  , 'AUTH_EVENTS'
  , 'BRANDS'
  , 'AuthService'
  , 'BrandService'

  , function (
    $rootScope
  , $location
  , $state
  , $stateParams
  , $idle
  , $anchorScroll
  , AUTH_EVENTS
  , BRANDS
  , AuthService
  , BrandService){
    
    AuthService.getOktaAuthentication();

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;


    $rootScope.$on('ngDialog.opened', function (e, $dialog) {
      $rootScope.dialogOpen = true;
    });
    $rootScope.$on('ngDialog.closed', function (e, $dialog) {
      $rootScope.dialogOpen = false;
      $rootScope.errorDialog = false;
    });

    var brands = BrandService.returnAvailableBrands();

    $idle.watch();

    $rootScope.$on('$idleTimeout', function() {
      if(AuthService.isAuthenticated()) {
        AuthService.logout();
      }
    });

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams) {
      if (next.url != '/restricted' && next.url != '/notfound' && next.url != '/login') {
        if(!AuthService.isAuthenticated()){
          // if user is not logged in and attempts to access a route other than /login, send to /login
          event.preventDefault();
          $state.go('login');
        } else if (brands.indexOf(nextParams.brand) > -1 && !AuthService.isAuthorized(nextParams.brand)) {
          // if user attempts to access a route they aren't authorized to view send to /restricted
          event.preventDefault();
          $state.go('restricted');
        } else if (nextParams.brand && !(brands.indexOf(nextParams.brand) > -1)) {
          // if user attempts to access route that doesn't exist send to /notfound
          event.preventDefault();
          $state.go('notfound');
        }
      }
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      $anchorScroll();
      var url = $location.url();
      // remove hash from URL for browsers that don't support the HTML5history object before sending path to GA
      if (url.indexOf('#') > -1) {
        url = url.slice(2);
      }
      ga('send', 'pageview', url);
    });



}]);
