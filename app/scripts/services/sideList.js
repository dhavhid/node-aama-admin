'use strict';

App.factory('SideList', function(__, $q, $rootScope){
	return function(){
		var self = this;
		var uniqueId;

		this.use = false;
		this.items = [];

		var defaults = {
			module: {},
			loader: false,
			inactive: false,
			title: '',
			listClass: '',
			items: [],
			loadedDfd: $q.defer(),
			visible: false,
			onSelect: null,
			onClick: null,
			namePrefix: '',
			nameFields: ['name'],
			showLogo: true,
			thumbFields: ['images', 'logo', 'data', 'thumb'],
			defaultLogo: 'images/no-logo.png',
			showAddBtn: true,
			showHidden: false,
			onAdd: _.noop,
			key: 'id',
			load: _.noop,
			loadApiMethod: '',
			type: '',
			preFiltersTpl: '',
			treeView: false,
			treeNodeFieldName: '',
			selected: {},
			filters: {
				kw: '',
				kwSearchFields: [],
				kwFunc: defaultKwFunc
			}
		};

		function defaultKwFunc(obj, index){
			return __.defaultKwFunc(obj, index, self.filters.kw, self.filters.kwSearchFields.length ? self.filters.kwSearchFields : self.nameFields);
		};


		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			self.hide();
		});


		this.getDefaults = function(){
			return angular.copy(defaults);
		};


		this.showLoader = function(){
			self.loader = true;
			return self;
		};


		this.hideLoader = function(){
			self.loader = false;
			return self;
		};


		this.deactivate = function(){
			self.inactive = true;
			return self;
		};


		this.activate = function(){
			self.inactive = false;
			return self;
		};


		this.show = function(){
			self.visible = true;
			return self;
		};


		this.hide = function(){
			self.visible = false;
			return self;
		};


		this.toggle = function(state){
			(typeof state === 'undefined') && (state = !self.visible);
			self.visible = state;
			return state;
		};



		this.setItems = function(items){
			self.items = null;
			self.items = items;
			return self;
		};


		this.removeItemById = function(id){
			var deletedIndex = getItemIndexById(id);
			if(typeof deletedIndex !== 'undefined'){
				return self.items.splice(deletedIndex, 1);
			}
			return false;
		};


		this.updateItemById = function(id, item){
			var updatedItemIndex = getItemIndexById(id);
			if(typeof updatedItemIndex !== 'undefined'){
				self.items[updatedItemIndex] = item;
				if(item.id === self.selected.id){
					self.select(item);
				}
				return true;
			}
			return false;
		};


		this.addItem = function(item, position){
			position === 'start' ? self.items.unshift(item) : self.items.push(item);
			return self;
		};


		this.getItemById = getItemById;
		function getItemById(id){
			return self.items.searchByCriteria({id: id}).item;
		};


		this.getItemIndexById = getItemIndexById;
		function getItemIndexById(id){
			return self.items.searchByCriteria({id: id}).index;
		};


		this.setSelectedItems = function(selectedKeys, key){
			key = key || self.key;
			var keys = [];
			if(selectedKeys instanceof Array){
				if(selectedKeys[0] instanceof Object){
					_.forEach(selectedKeys, function(selectedItem){
						keys.push(selectedItem[key]);
					});
					selectedKeys = angular.copy(keys);
				}
			}

			function recur(items){
				_.forEach(items, function(item){
					if(selectedKeys instanceof Array){
						item._selected = _.contains(selectedKeys, item[key]);
					}else{
						item._selected = (item[key] === selectedKeys);
					}
					
					if(self.treeView && item[self.treeNodeFieldName] && item[self.treeNodeFieldName].length){
						recur(item[self.treeNodeFieldName]);
					}
				});
			};
			
			recur(self.items);
			
			return self;
		};


		this.getSelected = function(key){
			key = key || self.key;
			var res = {keys: [], items: []};
			
			function recur(items){
				_.forEach(items, function(item){
					if(item._selected){
						key && res.keys.push(item[key]);
						res.items.push(item);
					}
					if(self.treeView && item[self.treeNodeFieldName] && item[self.treeNodeFieldName].length){
						recur(item[self.treeNodeFieldName]);
					}
				});
			};
			
			recur(self.items);

			return res;
		};


		this.getSelectedKeys = function(key){
			key = key || self.key;
			return self.getSelected(key)['keys'];
		};


		this.getSelectedItems = function(){
			return self.getSelected()['items'];
		};


		/**
		 *
		 * @returns integer id - unique list id for check list after resolve promises for load items
		 */

		this.setUniqueId = function(){
			uniqueId = Math.random();
			return uniqueId;
		};

		/**
		 *
		 * @returns {Number}
		 */
		this.getUniqueId = function(){
			return uniqueId;
		};
	};
});