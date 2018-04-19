'use strict';

App.service('LeftList', function(__, $rootScope, SideList, $q, Api, $state){
	SideList.call(this);
	var self = this;

	var defaults = {
		select: select,
		unselect: unselect,
		click: click,
		load: load
	};

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		self.use = !__.getObjVal(toState, 'data.notUseLeftList', false);
		!self.use && self.setDefaults();
	});


	this.setDefaults = function(opts, force){
		opts = opts || {};
		var baseDefaults = _.assign(self.getDefaults(), defaults);
		if(opts.type && self.type === opts.type && !force) return;
		if(opts.filters){
			opts.filters = _.assign(baseDefaults.filters, opts.filters);
		}
		_.assign(self, baseDefaults, opts);
		return self.setUniqueId();
	};


	function select(item, index){
		self.selected = item;
		self.hide();
		self.onSelect && self.onSelect(item, index);
		$rootScope.$broadcast('leftlist:select', item, index);
	};


	function unselect(){
		self.select({});
	};


	function click(item, index){
		self.selected = item;
		self.hide();
		self.onClick && self.onClick(item, index);
	};


	this.getListForSelectedItem = function(params){
		var dfd = $q.defer();
		self.loadedDfd.promise.then(function(){
			var items = self.items;
			if(params.item && !items.length){
				!items.searchByCriteria({id: params.item.id}).item && items.push(params.item);
			}
			var selectedItem = __.getObjVal(items, [0], {});

			if(params.onSelectCurrent && params.onSelectCurrent(selectedItem.id)) return false;

			selectedItem = items.searchByCriteria({id: params.itemId}).item;

			if(selectedItem){
				dfd.resolve(selectedItem);
			}else if(params.apiMethod){
				Api[params.apiMethod].apply(null, params.apiParams).then(dfd.resolve, dfd.reject);
			}else{
				dfd.reject();
			}

			dfd.promise.then(self.select, self.unselect).finally(function(){
				(!self.items.length && params.notFoundRedirectState) && $state.go(params.notFoundRedirectState, params.notFoundRedirectParams);
			});
		}, function(){
			dfd.reject();
			(!self.items.length && params.notFoundRedirectState) && $state.go(params.notFoundRedirectState, params.notFoundRedirectParams);
		});

		return self.loadedDfd.promise.then(function(){
			return dfd.promise;
		}, function(){
			return dfd.promise;
		});
	};


	function load(apiReqParams, resp){
		self.showLoader();
		self.loadedDfd = $q.defer();

		// if resp is defined set it as request responce
		if(resp){
			var req = self.loadedDfd.promise;
			self.setItems(__.getObjVal(resp, 'data', []));
			self.loadedDfd.resolve(resp);
			self.hideLoader();
		}else{
			Api.setShowHidden(this.showHidden, 'once');
			var apiMethod = (typeof self.loadApiMethod === 'function') ? self.loadApiMethod() : self.loadApiMethod,
			    req = Api[apiMethod].apply(null, apiReqParams);

			req.then(function(resp){
				self.setItems(__.getObjVal(resp, 'data', []));
				self.loadedDfd.resolve(resp);
			}, self.loadedDfd.reject).finally(self.hideLoader);
		}
		return req;
	};
});