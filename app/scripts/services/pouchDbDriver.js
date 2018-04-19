'use strict';

App.service('pouchDbDriver', function(Config, pouchDB){
	var self;


	function driver(){
		self = this;

		this.db = new pouchDB(Config.dbName, {
			auto_compaction: true,
			location: 2,
			adapter: window.isCordova ? 'websql' : undefined
		});

		//this.db.info().then(console.log.bind(console));
	};


	driver.prototype.get = function(key, defaultVal){
		return this.db.get(key).then(function(doc){
			return doc;
		}).catch(function(err){
			return defaultVal;
		});
	};


	driver.prototype.set = function(key, value, append){
		return this.db.get(key).then(function(doc){
			var updatedDoc = {};
			if((typeof doc === 'object') && append){
				updatedDoc = _.cloneDeep(doc) || {};
				for(var i in value) if(value.hasOwnProperty(i)){
					updatedDoc[i] = value[i];
				}
			}else{
				updatedDoc = value;
			}
			return self.db.put(updatedDoc, key, doc._rev);
		}).catch(function(err){
			return self.db.put(value, key);
		});
	};


	driver.prototype.remove = function(key, settingsKey){
		return this.db.get(key).then(function(doc){
			if(settingsKey){
				if((typeof doc === 'object')){
					var updatedDoc = _.cloneDeep(doc) || {};
					delete(updatedDoc[settingsKey]);
				}
				return self.db.put(updatedDoc, key, doc._rev);
			}else{
				return self.db.remove(doc);
			}
		});
	};


	return new driver();
});