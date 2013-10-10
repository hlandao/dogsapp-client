angular.module(_SERVICES_).factory('Account', ['$http', 'Storage', '$q', '$log', 'User' ,function($http, Storage, $q, $log, User) {
    var storageKey = 'account',
        initDefer = $q.defer(),
        account = {},
        baseAccountUrl = _BASE_API_URL + '/users';

    var loginUrl = baseAccountUrl + '/session',
        logoutUrl = _BASE_API_URL + '/signout',
        updateLocationUrl =  baseAccountUrl + '/update_location',
        aroundMeUrl =  baseAccountUrl + '/around_me',
        sendIMUrl =  baseAccountUrl + '/send_im',
        chatHistoryUrl = baseAccountUrl + '/chat_history',
        inboxUrl =  baseAccountUrl + '/inbox',
        notificationsReportUrl =  baseAccountUrl + '/report_notifications';





    /**
     * init the account service and resolve/reject the initDefer which the entire app is dependant on
     */
    var init = function(){
        User.initDefer.promise.finally(function(){
           account.user = User.user();
            initDefer.resolve();
        });
    };



    /**
     * login user
     * @param _account
     * @param done
     */
    var login = function (_account, done){
        if(!_account) return done && done({error : 'account was empty'});
        beforeLogin(_account, function(err){
            if(err) return done && done(err);
            $http.post(loginUrl, _account).success(function(data){
                if(data){
                    $log.debug('[Account] login successfull', data);
                    return User.set(data, function(err){
                        if(err){
                            done && done({error : 'could not save user account'});
                        }else{
                            account.user = User.user();
                            done && done(null, account);
                        }
                    });
                }else{
                    $log.debug('[Account] user logged in unsuccessfully, got empty object from server');
                    done && done({error : 'empty user account from server'});
                }
            }).error(function(err){
                    $log.debug('[Account] failed to login', err);
                    done && done(err);
                });
        })
    };


    /**
     * logout user
     * @param done
     */
    var logout = function (done){
        return User.reset(function(err){
            if(err){
                done && done({error : 'could not save user account'});
            }else{
                account.user = null;
                done && done(null);
            }
        });
    };


    /**
     * validates account object before login
     * @param _account
     * @param done
     */
    var beforeLogin = function(_account, done){
        done && done(null);
    };


    /**
     * create new user account
     * @param _account
     * @param done
     */
    var create = function (_account, done){
        if(!_account) return done && done({error : 'account was empty'});
        beforeCreate(_account, function(err){
            if(err) return done && done(err);
            $http.post(baseAccountUrl, _account).success(function(data){
                if(data){
                    $log.debug('[Account] user account was created successfully', data);
                    return User.set(data, function(err){
                        if(err){
                            done && done({error : 'could not save user account'});
                        }else{
                            account.user = User.user();
                            done && done(null, account);
                        }
                    });
                }else{
                    $log.debug('[Account] user account created unsuccessfully, got empty object from server');
                    done && done({error : 'empty user account from server'});
                }
            }).error(function(err){
                    $log.debug('[Account] failed to create user account', err);
                    done && done(err);
            });
        })
    };

    /**
     * validates account object before create
     * @param _account
     * @param done
     */
    var beforeCreate = function(_account, done){
        done && done(null);
    };


    /**
     * send current location to server
     */
    var updateLocation = function(coords, done){
        var loc = [coords.latitude, coords.longitude];
        $http.post(updateLocationUrl,{loc : loc}).success(function(usersAroundMe){
            done && done(null, usersAroundMe);
        }).error(function(err){
            console.error(err);
            done && done(err);
        });
    };


    /**
     * get users around me
     */
    var aroundMe = function(coords, done){
        var loc = [coords.latitude, coords.longitude];
        $http.post(aroundMeUrl,{loc : loc}).success(function(users){
            done && done(null, users);
        }).error(function(err){
            console.error(err);
            done && done(err);
        });
    };


    /**
     * send IM to user
     */
    var sendIM = function(toUser, message, done){
        $http.post(sendIMUrl,{to : toUser, message : message}).success(function(message){
            done && done(null, message);
        }).error(function(err){
                console.error(err);
                done && done(err);
        });
    };


    /**
     * get chat history with user
     */
    var chatHistory = function(withUser, done){
        $http.post(chatHistoryUrl, {withUser : withUser}).success(function(history){
            done && done(null, history);
        }).error(function(err){
                console.error(err);
                done && done(err);
        });
    };


    /**
     * get chat history with user
     */
    var inbox = function(done){
        $http.get(inboxUrl).success(function(inbox){
            done && done(null, inbox);
        }).error(function(err){
            console.error(err);
            done && done(err);
        });
    };


    /**
     * Report to the server that the user was notified about these messages
     * @param notifications
     */
    var reportNotifications = function(notifications, done){
        var ids = _.pluck(notifications, '_id');
        $http.post(notificationsReportUrl, {ids : ids}).success(function(response){
            done && done(null, response);
        }).error(function(err){
                console.error(err);
                done && done(err);
        });
    };

    init();

    return {
        init : init,
        initDefer : initDefer,
        login : login,
        logout : logout,
        create : create,
        updateLocation : updateLocation,
        aroundMe : aroundMe,
        sendIM : sendIM,
        chatHistory : chatHistory,
        inbox : inbox,
        reportNotifications : reportNotifications,
        account : function(){
            return account;
        }
    }
}]);
