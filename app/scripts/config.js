'use strict';

App.constant('Config', {
	local: {
		serverUrl: 'http://10.0.0.109:3000/'
	},
	dev: {
		serverUrl: 'http://52.88.240.184/service/api/'
		/*serverUrl: 'http://localhost:3000/api/'*/
	},
	prod: {
		serverUrl: 'http://service.aama.com/'
	},
	defaults: {
		location: {lat: 36.1539816, lng: -95.992775},
		lang: 'en_US'
	},
	defaultDbDriver: 'localStorage', // [localStorage, pouchDb]
	dbName: 'aama',
	uniqStorageKey: 'id',
	debug: false,
	config: 'dev'
});
