'use strict';

App.directive('scrollTop', function($timeout){
    return {
        restrict: 'A',
        scope: {
            trigger: '=scrollTop'
        },
        link: function(scope, elem) {
            scope.$watch('trigger', function() {
                $timeout(function(){
					elem[0].scrollTop = 0;
				}, 200);
            });
        }
    };
});