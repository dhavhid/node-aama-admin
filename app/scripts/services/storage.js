'use strict';

App.service('Storage', function(Config, pouchDbDriver, localStorageDriver, $rootScope, __){
	var drivers = {pouchDb: pouchDbDriver, localStorage: localStorageDriver},
	    prevDriver,
		isSetDriverOnce = false,
	    self = this;

	this.driver = Config.defaultDbDriver;


	function getDriver(){
		var driver = drivers[self.driver];
		if(isSetDriverOnce){
			isSetDriverOnce = false;
			self.setDriver(prevDriver);
		}
		return driver;
	};


	this.setDriver = function(driver){
		self.driver = driver;
		return self;
	};


	this.setDriverOnce = function(driver){
		prevDriver = this.driver;
		isSetDriverOnce = true;
		self.setDriver(driver);
		return self;
	};


	this.getUniqKey = function(key, modifier){
		(typeof key === 'undefined') && (key = false);
		modifier = modifier || __.getObjVal($rootScope, ['authUser', Config.uniqStorageKey]);
		if(typeof modifier !== 'undefined'){
			return (key === false) ? modifier : key + '_' + modifier;
		}else{
			return key;
		}
	};


	this.get = function(key, defaultVal, isUniq){
		key = key || 'settings';
		isUniq && (key = this.getUniqKey(key));
		return getDriver().get(key, defaultVal);
	};


	this.set = function(key, value, append, isUniq){
		(typeof append === 'undefined') && (append = false);
		isUniq && (key = this.getUniqKey(key));
		return getDriver().set(key, value, append);
	};


	this.remove = function(key, settingsKey, isUniq){
		isUniq && (key = this.getUniqKey(key));
		return getDriver().remove(key, settingsKey);
	};
});