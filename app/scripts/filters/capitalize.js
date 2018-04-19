App.filter('capitalize', function() {
	return function(txt){
		return !txt ? '' : txt.charAt(0).toUpperCase() + txt.substr(1);
	};
});