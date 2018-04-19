App.filter('nl2br', function($sce){
	return function(msg){
		if(!msg) return '';
		msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
		return $sce.trustAsHtml(msg);
	};
});