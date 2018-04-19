'use strict';

App.service('ImageParams', function($q) {
	return function(url, container, setContainerAttrs){
		setContainerAttrs = setContainerAttrs || false;

		var img = new Image(),
			dfd = $q.defer();

		if(!url){
			dfd.reject(lang('Image loading error'));
			return dfd.promise;
		}

		img.onload = function(){
			var res = {
					url: url,
					height: img.height,
					width: img.width,
					elHeight: null,
					elWidth: null,
					scale: null,
					scaleX: null,
					scaleY: null
				};
			if(typeof container !== 'undefined' && container[0]){
				var contEl = container[0];
				res.elHeight = contEl.clientHeight,
				res.elWidth = contEl.clientWidth,
				res.scale = (res.height/res.width > res.elHeight/res.elWidth) ? res.elHeight / res.height : res.elWidth / res.width;
				res.scaleX = res.elWidth / res.width;
				res.scaleY = res.elHeight / res.height;
			}

			if(setContainerAttrs){
				container
					.attr('data-img-height', res.height)
					.attr('data-img-width', res.width)
					.attr('data-img-scale', res.scale)
					.attr('data-img-scale-x', res.scaleX)
					.attr('data-img-scale-y', res.scaleY)
					.attr('data-img-scaled-width', res.scale * res.width)
					.attr('data-img-scaled-height', res.scale * res.height);
			}

			dfd.resolve(res);
		};

		img.onerror = function(){
			dfd.reject(lang('Image loading error'));
		};

		img.src = url;

		return dfd.promise;
	};
});