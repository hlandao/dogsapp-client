angular.module(_CONTROLLERS_).controller('MainController', ['$scope', 'Account', '$location','Runtime', function($scope, Account, $location,Runtime) {
  $scope.runtime = Runtime;
  $scope.runtime = {showLoader : false};

  $scope.logout = function(){
      Account.logout(function(){
          $location.path('/');
      });
  }

  $scope.dismissAlert = function(){
      if($scope.runtime.alertCallback) $scope.runtime.alertCallback();
      $scope.runtime.alertCallback=null;
      $scope.runtime.alert=null;
  }

    /**
     * switch to view instead of using a-href tag
     * @param view
     */
    $scope.switchTo = function(view){
        var path = $location.path();
        if(path && path.indexOf(view) > -1) return;
        $location.path(view);
    };

}]);
