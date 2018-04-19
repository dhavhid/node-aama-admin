'use strict';

App.directive('focus', function($timeout){
	return {
		link: function(scope, element, attrs) {
			scope.$watch(attrs.focus, function(value) {
				if(value) {
					$timeout(function(){
						element[0].focus();
						scope[attrs.focus] = false;
					});
				}
			});
		}
	};
});