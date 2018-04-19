'use strict';

App.service('localStorageDriver', function(){
	var self;


	function driver(){
		self = this;
	};


	driver.prototype.get = function(key, defaultVal){
		if(localStorage[key]){
			try{
				return JSON.parse(localStorage[key]);
			}catch(e){
				return defaultVal;
			}
		}else{
			return defaultVal;
		}
	};


	driver.prototype.set = function(key, value, append){
		var settings = self.get(key) || {};
		if((typeof value === 'object') && append){
			for(var i in value) if(value.hasOwnProperty(i)){
				settings[i] = value[i];
			}
		}else{
			settings = value;
		}
		if(typeof settings !== 'undefined' && settings !== 'undefined'){
			localStorage[key] = JSON.stringify(settings);
		}
		return settings;
	};


	driver.prototype.remove = function(key, settingsKey){
		var settings = self.get(key);
		if(settingsKey){
			if(typeof settings === 'object' && settings !== null){
				delete(settings[settingsKey]);
				self.set(key, settings, false);
			}
			return settings;
		}else{
			delete(localStorage[key]);
		}
	};


	return new driver();
});