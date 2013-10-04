angular.module(_SERVICES_).factory('Storage', function($rootScope) {
   var storage = new MyStorage();

    return {
        set : function(obj, done){
            storage.set(obj, function(result){
                done && done(null, result);
            });
        },

        get : function (key, done){
            storage.get(key, function(err, result){
                $rootScope.$apply(function(){
                    done && done(err, result);
                });
            });
        },

        remove : function(key, done){
            storage.remove(key, function(err, result){
                $rootScope.$apply(function(){
                   done && done(err, result);
                });
            });
        }
    }
});


function MyStorage(params) {
    if (params && params.useChromeStorage && chrome && chrome.storage && chrome.storage.local) this.initChromeStorage();
    else this.initLocalStorage();
}

MyStorage.prototype = {
    initChromeStorage: function STORAGE_initChromeStorage() {
        $.extend(this, chrome.storage.local);
    },
    initLocalStorage: function STORAGE_initLocalStorage() {
        this.set = function (obj, done) {
            try {
                for (var i in obj) {
                    var raw = obj[i] || '';
                    var value = JSON.stringify(raw);
                    var key = i;
                    localStorage.setItem(key, value);
                    obj[i] = null;
                }
                obj = null;
                done && done(null, true);
            } catch (e) {
                done && done(e);
            }
        };

        this.get = function STORAGE_get_from_localstorage(key, done) {
            try {
                setTimeout(function () {
                    var item = localStorage.getItem(key);
                    if(item && item !== 'undefined') item = JSON.parse(item);
                    var obj = {};
                    obj[key] = item;
                    (done || common.nope)(null, obj);
                }, 0);
            } catch (e) {
                var obj = {};
                obj[key] = item;
                (done || common.nope)(null, item);
            }
        };

        this.remove = function STORAGE_remove_from_localstorage(key, done) {
            localStorage.removeItem(key);
            (done || common.nope)();
        }
    }
};