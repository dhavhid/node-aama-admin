'use strict';

App.directive('mInput', function($parse, $compile, $timeout){
	var scope = {
		onRemove: '&'
	};


	function link(scope, element, attrs, ctrl){
		var input = element.find('input'),
		    select = element.find('select'),
		    textarea = element.find('textarea'),
		    isTextarea = textarea.length,
		    inputEl = input.length ? input : (textarea.length ? textarea : select),
		    ngModel = inputEl.attr('ng-model'),
		    $scope = inputEl.scope(),
		    isClearable = $parse(attrs.clearable)(),
		    isRemovable = $parse(attrs.removable)();

		if(isClearable || isRemovable){
			element.addClass('w-btn');
			inputEl.after($compile('<button type="button" class="btn btn-clear icon-close" ng-click="clear()"></button>')(scope));

			scope.clear = function(){
				if(isRemovable){
					element.remove();
					scope.onRemove();
				}else{
					inputEl.val('');
					inputEl.triggerHandler('input');
				}
			};
		}

		attrs.$observe('label', function(label){
			scope.label = label;
		});
		inputEl.after($compile('<label>{{label}}</label>')(scope));

		if(ngModel){
			$scope.$watch(ngModel, function(newVal, oldVal){
				if(typeof newVal === 'undefined' || newVal === '' || newVal === null){
					element.addClass('empty');
				}else{
					element.removeClass('empty');
					isTextarea && textareaResize();
				}
			});
		}
		
		var isBadInput = inputEl[0] && (inputEl[0].validity||{}).badInput;
		!inputEl.val() && !isBadInput && element.addClass('empty');
		inputEl.on('change keydown keypress keyup', function(){
			var isBadInput = (inputEl[0].validity||{}).badInput;
			this.value || isBadInput ? element.removeClass('empty') : element.addClass('empty');
		});

		if(isTextarea && document.defaultView && document.defaultView.getComputedStyle){
			inputEl.on('keypress keyup', textareaResize);
		}

		function textareaResize(){
			function resize(){
				var el = textarea[0],
				    lineHeight = parseInt(getComputedStyle(el).getPropertyValue('line-height')),
				    paddings = el.offsetHeight - el.clientHeight,
				    maxHeight = +attrs.maxHeight || Infinity,
				    minHeight = lineHeight * 2 + paddings;

				if(!lineHeight) return;

				element[0].style.height = element[0].offsetHeight + 'px';
				el.style.height = '0px';
				el.style.overflowY = 'hidden';
				var newHeight = el.scrollHeight + paddings;
				element[0].style.height = 'auto';
				(newHeight < minHeight) && (newHeight = minHeight);
				if(newHeight > maxHeight){
					newHeight = maxHeight;
					el.style.overflowY = 'auto';
				}
				el.style.height = newHeight + 'px';
				el.selectionStart && (el.selectionStart = el.selectionStart); // fix firefox scrolling to cursor position
			};

			$timeout(resize);
		};
	};


	return {
		restrict: 'EA',
		transclude: false,
		scope: scope,
		link: link
	};
});