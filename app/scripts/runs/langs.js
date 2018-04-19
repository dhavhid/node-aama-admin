'use strict';

App.run(function($window, gettextCatalog, Storage, Config){
	$window.lang = function(str){
		return gettextCatalog.getString(str);
	};
	$window.currentLang = function(lng){
		if(lng){
			gettextCatalog.setCurrentLanguage(lng);
			Storage.set('lang', lng);
		}
		return gettextCatalog.currentLanguage;
	};
	$window.currentLang(Storage.get('lang', Config.defaults.lang));
});
