'use strict';

App.run(function($rootScope, $window, $location){
	$window.stateHistory = [];

	$rootScope.$on('$locationChangeStart', function (e, to, from) {
		var toPath = $location.$$path || '',
			length = $window.stateHistory.length;

		if(!toPath) return;

		if($rootScope.isBackButtonPushed && $window.stateHistory[length - 2] && $window.stateHistory[length - 2] === toPath){
			angular.element(document.querySelectorAll('ui-view')).addClass('reverse');
			$rootScope.isReverse = true;
			$window.stateHistory.pop();
		}else{
			angular.element(document.querySelectorAll('ui-view')).removeClass('reverse');
			$rootScope.isReverse = false;
			$window.stateHistory = _.without($window.stateHistory, toPath);
			$window.stateHistory.push(toPath);
		}
		$rootScope.isBackButtonPushed = false;
	});
});
