'use strict';

App.directive('bgImg', function(ImageParams, $parse){
	return function(scope, element, attrs){
		attrs.$observe('bgImg', function(value){
			var hint = attrs.hint || '',
			    broadcast = $parse(attrs.broadcast)(),
			    defaultImage = attrs.defaultImage;

			element.removeClass('image-loaded');
			element.css({'background-image': 'none'});
			if(!element.find('load').length){
				element.append('<load style="display: block; width: 100%; height: 100%; text-align: center; background-color: rgba(0,0,0,0.5); color: #fff;">' +
									'<div style="position: relative; top: 50%; top: calc(50% - 10px);">' +
										'<i class="icon-loading spin"></i>' + (hint ? '&nbsp;' + hint : '') +
									'</div>' +
								'</load>');
			}
			if(!value){
				element.css({'background-image': 'none'});
				element.addClass('no-image');
				defaultImage && element.css({'background-image': "url('" + defaultImage + "')"});
			}

			ImageParams(value, element, true).then(function(params){
				element.removeClass('no-image');
				element.css({'background-image': "url('" + value + "')"});
				$parse(attrs.setMaxWidth)() && element.css({'max-width': params.width + 'px'});
				$parse(attrs.setMaxHeight)() && element.css({'max-height': params.height + 'px'});
				$parse(attrs.setWidth)() && element.css({'width': params.width + 'px'});
				$parse(attrs.setHeight)() && element.css({'height': params.height + 'px'});
				element.addClass('image-loaded');
				broadcast && scope.$broadcast('imageLoaded', _.assign(params, {element: element}));
			}, function(){
				defaultImage && element.css({'background-image': "url('" + defaultImage + "')"});
			}).finally(function(){
				element.find('load').remove();
			});
	   });
	};
});