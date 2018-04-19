App.filter('string', function(){
	return function(text){
		if(!text) return '';

		switch(typeof text){
			case 'string':
				return text;
			case 'object':
				if(text instanceof Array){
					return text.join(', ');
				}else if(text === null){
					return '';
				}else if(text instanceof Object && text){
					return angular.toJson(text);
				}
				return text;
		}

		return text;
	};
});