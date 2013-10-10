angular.module(_DIRECTIVES_).directive('scrollBottom', ['$rootScope', function($rootScope){
    return function(scope, element, attrs){
        var scrollToBottom = function(){
            setTimeout(function(){
                var height = element[0].scrollHeight;
                console.log('height',height);
                element.scrollTop(height);

            },50);
        }

        scrollToBottom();

        $rootScope.$on('scrollBottom', scrollToBottom);
    };
}])