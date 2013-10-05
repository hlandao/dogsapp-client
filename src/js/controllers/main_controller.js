angular.module(_CONTROLLERS_).controller('MainController', ['$scope', 'Account', '$location', function($scope, Account, $location) {

  $scope.logout = function(){
      Account.logout(function(){
          $location.path('/');
      });
  }
}]);
