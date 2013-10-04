


angular.module(_CONTROLLERS_).controller('DashboardController', function($scope, Account, $location, geolocation, $timeout) {
    var _account = Account.account();
    var updateLocationTimeout;
    var isCentered;

    $scope.popups = {
        notifications : false,
        user : null
    };

    var local_icons = {
        default_icon: L.icon({
            iconUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
            shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 40],
            popupAnchor: [0, -40],
            shadowSize: [41, 41],
            shadowAnchor: [12, 40]
        }),
        default_dog_icon: L.divIcon({
            iconSize: [40, 40],
            html: '<div class="doggy-icon-wrapper"><img src="./img/doggy64.png"></div>',
            popupAnchor:  [0, 0]
        })
    };

    var getDoggyIcon =  function(icon){
        if(icon){
          return L.divIcon({
              iconSize: [40, 40],
              html: '<div class="doggy-icon-wrapper" ng-click="alert(1)"><img src="'+icon+'"></div>',
              popupAnchor:  [0, 0]
          });
        }else{
           return local_icons.default_dog_icon
        }
    };

    angular.extend($scope, {
        icons: local_icons
    });

    var getLocation = function(options, done){
        geolocation.getCurrentPosition( function GCPSuccess(locationData){
            done(null, locationData);
        }, function GCPError(err){
            done(err);
        }, options);
    };

    if(!_account.user){
        $location.path('/');
    }


    angular.extend($scope, {
        defaults: {
            maxZoom: 19
        }
    });




    $scope.center = {lat : 0,lng : 0};
    $scope.markers = {};


    var init = function(){
        getLocation(null, function(err, locationData){
            centerMe(locationData.coords);
        });

    };


    /**
     * center the map to the user location
     */
    var centerMe = function(coords){
        isCentered = true;
        angular.extend($scope.center, {
            lat: coords.latitude,
            lng: coords.longitude,
            zoom: 16
        });

        updateMyMarkerInTheMap(coords);

    };


    /**
     * updates the user marker to the current location
     * @param lat
     * @param lng
     */
    var updateMyMarkerInTheMap = function(coords){
        $scope.markers.me = {
            lat: coords.latitude,
            lng: coords.longitude,
            message : "me"
        }
    };


    /**
     * update user location and intitates the timeout of updating user location;
     */

    var updateLocation = function(timeout){
        getLocation(null, function(err, locationData){
            if(isCentered) centerMe(locationData.coords);
            Account.updateLocation(locationData.coords, function(err, response){
                if(response && response.aroundMe) updateUsersAroundMe(response.aroundMe);
                if(response) processNotifications(response.notifications);
            });
        });

        if(timeout){
            updateLocationTimeout = $timeout(function(){
                updateLocation(timeout);
            }, timeout);
        }
    };


    var processNotifications = function(notifications){
        if(notifications && notifications.length){
            $scope.notifications = _.groupBy(notifications, function(noti){
               return noti.from;
            });

            $scope.notificationsCount = objectSize($scope.notifications);
        }else{
            $scope.notifications = null;
            $scope.notificationsCount = null;
        }

    };


    var objectSize = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    var updateUsersAroundMe = function(usersAroundMe){
        //
        angular.forEach(usersAroundMe, function(user){
            $scope.markers[user._id] = $scope.markers[user._id] || {};
            angular.extend($scope.markers[user._id], {
                lat : user.loc[0],
                lng : user.loc[1],
                icon : getDoggyIcon(user.dog.thumbnail),
                draggable: false,
                user : user,
                userId : user._id
            });

        });

    };


    $scope.$on('leafletDirectiveMarkersClick', function(event,markerId){
        console.log('leafletDirectiveMarkersClick');
        var marker = $scope.markers[markerId];
        $scope.popups.user = marker.user;
    });

    $scope.setUserPopup = function(user, e){
        console.log('setUserPopup');
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        $scope.popups.user = user;
        $scope.popups.notifications = false;
    };


    $scope.closeUserPopup = function(){
        $scope.popups.user = null;
    };


    $scope.initMapView = function(){
        $scope.uiState = "map";
    };

    $scope.initInboxView = function(){
        $scope.uiState = "inbox";
        Account.inbox(function(err, inbox){
            if(err){
                $scope.error = "Cannot get inbox";
            }else{
                $scope.inbox = inbox;
            }
        })
    };

    $scope.switchTo = function(view){
      var path = $location.path();
      if(path && path.indexOf(view) > -1) return;
        $location.path(view);
    };

    $scope.toggleNotifications = function(){
        console.log('toggleNotifications');
        $scope.popups.notifications = !$scope.popups.notifications;
        if($scope.popups.notifications){
            $scope.popups.user = null;
        }
    };

    init();
    updateLocation(10000);

});
