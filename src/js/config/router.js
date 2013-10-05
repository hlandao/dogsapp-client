/*
 * config/router.js
 *
 * Defines the routes for the application.
 *
 */
angular.module(_APP_).config([
  '$routeProvider',
  function($routeProvider, Account) {

    var accountResolve =  [ 'Account', '$q', function(Account, $q) {
        var defer = $q.defer();

        Account.initDefer.promise.then(function(result) {
            defer.resolve({ success: true, result : result });
        }, function(err) {
            defer.resolve({ success : false, reason : err });
        });

        return defer.promise;

    } ];


      var deviceReadyResolve =  [ 'phonegapReady', '$q', function(phonegapReady, $q) {
          var defer = $q.defer();

          var a = phonegapReady(function(){
              console.log('resovled!');
              defer.resolve();
          });

          a();

          return defer.promise;

      } ];


      // Define routes here.
    $routeProvider
    .when('/', {
    templateUrl: 'html/partials/home/home.html',
    controller: 'HomeController',
    resolve : {
        account : accountResolve
    }
    })
    .when('/login', {
        templateUrl: 'html/partials/home/login.html',
        controller: 'HomeController',
        resolve : {
            account : accountResolve
        }
    })
    .when('/dashboard', {
        templateUrl: 'html/partials/dashboard/map.html',
        controller: 'DashboardController',
        resolve : {
            account : accountResolve
        }
    })
    .when('/inbox', {
        templateUrl: 'html/partials/dashboard/inbox.html',
        controller: 'DashboardController',
        resolve : {
            account : accountResolve
        }
    })


        .otherwise({ redirectTo: '/' });

  }
]).config(['$httpProvider', function($httpProvider){
        // set global request interceptor to send access_token header
        $httpProvider.interceptors.push(['$q', 'User',function($q, User) {
            return {
                'request': function(config) {
                    var _user = User.user();
                    if(_user && _user.access_token && _user.access_token.token){
                        config.headers.access_token = _user.access_token.token;
                    }
                    return config || $q.when(config);
                }
            }
        }]);

}]);





