'use strict';

App.directive('dropdownToggle', ['$document', '$location', function ($document) {
	var openElement = null,
		closeMenu = angular.noop;

	return {
		restrict: 'CA',
		link: function (scope, element, attrs) {
			element.parent().bind('click', function () { closeMenu(); });
			element.bind('click', function (event) {
				var elementWasOpen = (element === openElement);

				event.preventDefault();
				event.stopPropagation();

				!!openElement && closeMenu();

				if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
					element.parent().addClass('open');
					openElement = element;
					closeMenu = function (event) {
						if (event) {
							event.preventDefault();
							event.stopPropagation();
						}
						$document.unbind('click', closeMenu);
						element.parent().removeClass('open');
						closeMenu = angular.noop;
						openElement = null;
					};
					$document.bind('click', closeMenu);
				}
			});
		}
	};
}]);