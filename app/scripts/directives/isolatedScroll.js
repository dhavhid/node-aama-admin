'use strict';

App.directive('isolatedScroll', function($parse, __){
	function getFirstTouch(e){
		return __.getObjVal(e, ['touches', 0]) || __.getObjVal(e, ['originalEvent', 'touches', 0]) || {};
	};


	function link(scope, element, attrs, ctrl){
		var isUse = ($parse(attrs.isolatedScroll)() !== false),
		    wrapperEl = angular.element(document.querySelector('#wrapper'));
		if(!isUse) return;

		element.on('mousewheel DOMMouseScroll', function(e){
			var delta = e.wheelDelta || __.getObjVal(e, 'originalEvent.wheelDelta', 0) || -e.detail,
			    el = element[0],
			    bottomOverflow = el.scrollTop + el.clientHeight - el.scrollHeight >= 0,
			    topOverflow = el.scrollTop <= 0;

			if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
				e.preventDefault();
			}
		});


		var lastY;
		element.on('touchstart', function(e){
			lastY = getFirstTouch(e).clientY;
		});

		element.on('touchmove', function(e){
			var el = element[0],
			    currentY = getFirstTouch(e).clientY,
			    bottomOverflow = el.scrollTop + el.clientHeight - el.scrollHeight >= 0,
			    topOverflow = el.scrollTop <= 0,
			    dir;

			if(currentY > lastY){
				dir = 'down';
			}else if(currentY < lastY){
				dir = 'up';
			}

			if((topOverflow && dir === 'down') || (bottomOverflow && dir === 'up') || !dir){
				e.preventDefault();
				wrapperEl.css('overflow-y', 'hidden');
			}else{
				wrapperEl.css('overflow-y', 'auto');
			}
			lastY = getFirstTouch(e).clientY;
			return true;
		});

		element.on('touchend touchcancel', function(e){
			wrapperEl.css('overflow-y', 'auto');
		});
	};


	return {
		restrict: 'EA',
		transclude: false,
		link: link
	};
});