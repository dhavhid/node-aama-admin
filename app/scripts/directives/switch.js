'use strict';

App.directive('switch', function($parse){
	var tpl =
		'<div class="onoff" ng-click="!options.disabled && (modelVar = !modelVar)">\n\
			<div class="onoff-bg" ng-class="{\'on\': modelVar}">\n\
				<span class="on-text" ng-if="options.showLabels">{{options.onText}}</span>\n\
				<span class="off-text" ng-if="options.showLabels">{{options.offText}}</span>\n\
				<div class="onoff-pimp z1"></div>\n\
			</div>\n\
		</div>';


	var scope = {
		modelVar: '=swModel'
	};


	function link(scope, element, attrs, ctrl){
		scope.options = {
			showLabels: true,
			onText: 'on',
			offText: 'off'
		};
		attrs.$observe('options', function(obj){
			scope.options = _.assign(scope.options, $parse(obj)());
		});
		attrs.$observe('disabled', function(val){
			scope.options.disabled = val;
		});
	};


	return {
		restrict: 'E',
		transclude: true,
		template: tpl,
		replace: false,
		scope: scope,
		link: link
	};
});