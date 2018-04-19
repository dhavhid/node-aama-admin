App.filter('textLoaded', function($sce){
	return function(msg){
		if(typeof msg === 'undefined') return $sce.trustAsHtml('<i class="icon-loading spin text-loaded"></i>');
		return msg;
	};
});