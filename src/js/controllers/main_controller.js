angular.module(_CONTROLLERS_).controller('MainController', function($scope, Account, $location) {

  $scope.logout = function(){
      Account.logout(function(){
          $location.path('/');
      });
  }
});
