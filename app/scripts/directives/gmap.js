'use strict';

App.directive('gmap', function($parse, $rootScope){
	function link(scope, element, attrs, ctrl){
		var mapEventCancelTO;

		element.on('mousedown touchstart', function(){
			mapEventCancelTO && clearTimeout(mapEventCancelTO);
			$rootScope.preventMenu = true;
		});

		element.on('mouseup mouseleave touchend touchcancel touchleave', function(){
			mapEventCancelTO = setTimeout(function(){$rootScope.preventMenu = false;}, 100);
		});
	};


	return {
		restrict: 'EA',
		transclude: false,
		link: link
	};
});