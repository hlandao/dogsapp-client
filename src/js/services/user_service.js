angular.module(_SERVICES_).factory('User', function(Storage, $q, $log) {
    var storageKey = 'user',
        initDefer = $q.defer(),
        user;


    /**
     * init the user service and resolve/reject the initDefer which the entire app is dependant on
     */
    var init = function(){
        Storage.get(storageKey, function(err, result){
            if(err){
                initDefer.reject(err);
            }else if(!result || !result[storageKey]){
                initDefer.reject();
            }else{
                user = result[storageKey];
                initDefer.resolve(user);
            }
        });
    };


    /**
     * set and store user  (usually after server response of login/sign up)
     * @param _account
     * @param done
     */
    var set = function(_user, done){
        user = _user;
        store(done);
    };


    /**
     * store account in the localstorage
     * @param done
     */
    var store = function(done){
        var toStore = {};
        toStore[storageKey] = user;
        Storage.set(toStore, done);
    };



    init();

    return {
        init : init,
        initDefer : initDefer,
        set : set,
        user : function(){
            return user;
        }
    }
});
