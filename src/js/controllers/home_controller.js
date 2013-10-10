angular.module(_CONTROLLERS_).controller('HomeController', ['$scope', 'Account', '$location','geolocation','phonegapReady', function($scope, Account, $location,geolocation,phonegapReady) {

    // trying to fix geolocation bug after login
    geolocation.getCurrentPosition(function(){}, function(){});

    var _account = Account.account();
    if(_account.user){
        $location.path('/dashboard');
    }
    $scope.newAccount = {dog : {}};

    $scope.createAccount = function(e){
        var a = $scope.newAccount;
        if(!a.email || !a.password || !a.dog || !a.dog.name){
            console.error('error validating details');
            $scope.error = "Please fill in all the details";
            return;
        }
      Account.create($scope.newAccount, function(err, account){
          if(err){
              console.error(err);
              $scope.error = "Error sign up. Please try again.";
          }else{
              $location.path('/dashboard');
          }
      });
    };


    $scope.login = function(e){
        Account.login($scope.loginAccount, function(err, account){
            if(err){
                console.error(err);
                $scope.error = "Error login. Please try again.";
            }else{
                $location.path('/dashboard');
            }

        });
    };


    $scope.takePicture = function(){
        var dt = 0; // DATA_URL
        $scope.newAccount.base64Image = null;
        $scope.newAccountDogThumbnail = null;
        navigator.camera.getPicture( function(result){
            $scope.$apply(function(){
                $scope.newAccount.base64Image = result;
                $scope.newAccountDogThumbnail = "data:image/jpeg;base64," + result;
            });
        }, function(err){
          console.error('error taking picture',err);
        }, { quality: 50, destinationType: dt
        });
    }


}]);
