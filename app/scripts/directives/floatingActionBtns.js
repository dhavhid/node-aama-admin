/**
 * Created by david on 4/12/16.
 */
'use strict';

App.directive('floatingActionBtns', function($timeout){
	return {
		restrict: 'AE',
		link: function(scope, elem, attrs) {
			$(window).scroll(function() {
				var s = $(".action-btns");
				var pos = s.position();
				var windowpos = $(window).scrollTop();
				if (pos != undefined) {
					if ($(window).scrollTop() + $(window).height() <= ($(document).height() - 100) || $(window).scrollTop() == 0) {
						s.addClass("stick");
					} else {
						s.removeClass("stick");
					}
				}
			});
			// add a listener to the form.
			$timeout(function() {
				scope.$watchCollection('input', function(newValue, oldValue) {
					var s = $(".action-btns");
					var pos = s.position();
					var windowpos = $(window).scrollTop();
					var form = scope.pageForm || scope.categoriesForm;
					if (!form.$pristine) {
						if (pos != undefined) {
							if ($(window).scrollTop() + $(window).height() <= ($(document).height() - 100) || $(window).scrollTop() == 0) {
								s.addClass("stick");
							} else {
								s.removeClass("stick");
							}
						}
					} else {
						s.removeClass("stick");
					}
				});
			}, 2000); // wait for 2 secs before watching.
		}
	}
});
