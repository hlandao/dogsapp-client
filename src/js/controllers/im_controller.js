angular.module(_CONTROLLERS_).controller('IMController', function($scope, Account, $location, geolocation, $timeout) {
    $scope.userToChat = $scope.userToChat || $scope.popups.user;

    if(!$scope.userToChat){
        return $scope.error = "Not available."
    }

    Account.chatHistory($scope.userToChat._id, function(err, history){
       if(err){
           $scope.error = "Cannot get chat history";
       }else{
           $scope.history = history;
       }
    });

    $scope.sendIM = function(message){
        if(!message) return;
        $scope.message='';
        Account.sendIM($scope.userToChat._id, message, function(err, _message){
            if(err){
                $scope.error = "Cannot send message please try again";
            }else{
                $scope.history.push(_message);
            }
        });
    };
});
