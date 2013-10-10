


angular.module(_CONTROLLERS_).controller('DashboardController', ['$scope', 'Account', '$location', 'geolocation', '$timeout', 'User', function($scope, Account, $location, geolocation, $timeout, User) {
    var _account = Account.account();
    var updateMarkerLocationTimeout;
    var updatePingTimeout
    var isCentered;
    var user;

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
            if(locationData && locationData.coords){
                user.locationData = locationData;
                User.set();
            }
            done(null, locationData);
        }, function GCPError(err){
            console.error(err);
            done(err);
        }, options);
    };



    angular.extend($scope, {
        defaults: {
            maxZoom: 19
        }
    });


    /**
     * Leaflet defaults - it is required to set these defaults in order to make it work;
     */
    $scope.center = {lat : 0,lng : 0};
    $scope.markers = {};


    /**
     * init both map view and inbox view (maybe we should move this logic into a 'parent' controller because
     * we always want to transmit our position to the server
     */
    var init = function(){

        if(!_account.user){
            $location.path('/');
        }

        user = User.user();

    };


    /**
     * center the map to the user location
     */
    var centerMe = function(coords, zoom){
        isCentered = true;
        var newCenter = {
            lat: coords.latitude,
            lng: coords.longitude
        };
        if(zoom) newCenter.zoom = zoom;
        angular.extend($scope.center, newCenter);

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
     * send user location to the server and initiates a periodic location update
     */

    var pingLocation = function(timeout){
        getLocation(null, function(err, locationData){
            if(err) return;
            Account.updateLocation(locationData.coords, function(err, response){
                if(response && response.aroundMe) updateUsersAroundMe(response.aroundMe);
                if(response) processNotifications(response.notifications);
            });
        });

        if(timeout){
            updatePingTimeout = $timeout(function(){
                pingLocation(timeout);
            }, timeout);
        }
    };


    /**
     * update user marker in the map
     */

    var updateMarkerLocation = function(timeout){
        getLocation(null, function(err, locationData){
           if(err){
               if(err.code === "TIMEOUT"){
                   $scope.runtime.alert="Cannot determine location.";
                   $scope.runtime.alertCallback=function(){
                       updateMarkerLocation();
                   };
               }else if(err.code === "POSITION_UNAVAILABLE"){
                   $scope.runtime.alert="Please enable your GPS.";
                   $scope.runtime.alertCallback=function(){
                       updateMarkerLocation();
                   };
               }
               return;
           }
            // if map is centered, update the center
            if(isCentered) centerMe(locationData.coords);
            // if not, just update my cursor
            else updateMyMarkerInTheMap(locationData.coords);

        });

        if(timeout){
            updateMarkerLocationTimeout = $timeout(function(){
                updateMarkerLocation(timeout);
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
        $scope.runtime.aroundMe =  usersAroundMe;
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


    /**
     * Event listener for map markers clicks
     */
    $scope.$on('leafletDirectiveMarkersClick', function(event,markerId){
        var marker = $scope.markers[markerId];
        $scope.setUserPopup(marker.user);
    });

    /**
     * if map has been dragged - it means we're not centered anymore
     */
    $scope.$on('leafletDirectiveMap.drag', function(event){
        isCentered = false;
    });

    /**
     * open user's popup
     * @param user
     * @param e
     */
    $scope.setUserPopup = function(user, e){
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        $scope.userPopup = user;
        $scope.popups.user = true;
        $scope.popups.notifications = false;
    };


    /**
     * closes the a popup
     */
    $scope.closeUserPopup = function(){
        $scope.popups.user = null;
    };


    /**
     * initiates the map view
     */
    $scope.initMapView = function(){
        $scope.runtime.alert = null;
        $scope.runtime.alertCallback=null;

        $scope.uiState = "map";
        init();
        updateMarkerLocation(500);

        $scope.runtime.showLoader = true;

        if(user && user.locationData && user.locationData.coords){

            centerMe(user.locationData.coords, 16);
            $scope.runtime.showLoader = false;

            if($scope.runtime.aroundMe) updateUsersAroundMe($scope.runtime.aroundMe);

        }else{

            $scope.runtime.showLoader = true;
            getLocation(null, function(err, locationData){

                $scope.runtime.showLoader = false;

                if(err){

                    if(err.code === "TIMEOUT"){
                        $scope.runtime.alert="Cannot determine location.";
                    }else if(err.code === "POSITION_UNAVAILABLE"){
                        $scope.runtime.alert="Please enable your GPS.";
                    }else{
                        $scope.runtime.alert=err.message;
                    }

                    return;
                }


                $scope.runtime.alert = null;
                $scope.runtime.alertCallback=null;


                centerMe(locationData.coords, 16);
            });
        }

    };


    /**
     * initiates the inbox view
     */
    $scope.initInboxView = function(){
        $scope.runtime.alert = null;
        $scope.runtime.alertCallback=null;

        $scope.uiState = "inbox";
        init();

        if($scope.runtime.inbox) $scope.inbox = $scope.runtime.inbox;
        else  $scope.runtime.showLoader = true;
        Account.inbox(function(err, inbox){
            $scope.runtime.showLoader = false;
            $scope.runtime.inbox = inbox;
            if(err){
                $scope.error = "Cannot get inbox";
            }else{
                $scope.inbox = inbox;
            }
        })
    };




    /**
     * show or hide notifications popup
     */
    $scope.toggleNotifications = function(){
        $scope.popups.notifications = !$scope.popups.notifications;
        if($scope.popups.notifications){
            $scope.popups.user = null;
        }
    };

    pingLocation(10000);

}]);
