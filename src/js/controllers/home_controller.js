angular.module(_CONTROLLERS_).controller('HomeController', function($scope, Account, $location) {
    console.log('HomeController');
    var _account = Account.account();
    if(_account.user){
        $location.path('dashboard');
    }
    $scope.newAccount = {dog : {}};

    $scope.createAccount = function(e){
        var a = $scope.newAccount;
        if(!a.email || !a.password || !a.name || !a.dog || !a.dog.name){
            console.error('error validating details');
            $scope.error = "Please fill in all the details";
            return;
        }
      Account.create($scope.newAccount, function(err, account){
          if(err){
              console.error(err);
              $scope.error = "Error sign up. Please try again.";
          }else{
              $location.path('dashboard');
          }
      });
    };


    $scope.login = function(e){
        Account.login($scope.loginAccount, function(err, account){
            if(err){
                $scope.error = "Error login. Please try again.";
            }else{
                $location.path('dashboard');
            }

        });
    };


    $scope.takePicture = function(){
        navigator.camera.getPicture( function(result){
           console.log(result)
        }, function(){

        }, { quality: 50
        });
    }


});
