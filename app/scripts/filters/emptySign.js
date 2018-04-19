App.filter('emptySign', function(){
	return function(msg){
		if(!msg) return '—';
		return msg;
	};
});