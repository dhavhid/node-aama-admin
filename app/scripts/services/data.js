'use strict';

App.service('Data', function(Api, __, RightList, Modal){
	var self = this;

	var defaults = {
		subjectMatterOptions: undefined,
		audienceOptions: undefined
	};

	var publicVars = {
		inited: null,
		isInited: false,
		module: {},
		tzs: [{name: 'UTC -12:00', val: '-12:00'},{name: 'UTC -11:00', val: '-11:00'},{name: 'UTC -10:00', val: '-10:00'},{name: 'UTC -09:00', val: '-09:00'},{name: 'UTC -08:00', val: '-08:00'},{name: 'UTC -07:00', val: '-07:00'},{name: 'UTC -06:00', val: '-06:00'},{name: 'UTC -05:00', val: '-05:00'},{name: 'UTC -04:30', val: '-04:30'},{name: 'UTC -04:00', val: '-04:00'},{name: 'UTC -03:30', val: '-03:30'},{name: 'UTC -03:00', val: '-03:00'},{name: 'UTC -02:00', val: '-02:00'},{name: 'UTC -01:00', val: '-01:00'},{name: 'UTC +00:00', val: '+00:00'},{name: 'UTC +01:00', val: '+01:00'},{name: 'UTC +02:00', val: '+02:00'},{name: 'UTC +03:00', val: '+03:00'},{name: 'UTC +03:30', val: '+03:30'},{name: 'UTC +04:00', val: '+04:00'},{name: 'UTC +04:30', val: '+04:30'},{name: 'UTC +05:00', val: '+05:00'},{name: 'UTC +05:30', val: '+05:30'},{name: 'UTC +05:45', val: '+05:45'},{name: 'UTC +06:00', val: '+06:00'},{name: 'UTC +06:30', val: '+06:30'},{name: 'UTC +07:00', val: '+07:00'},{name: 'UTC +08:00', val: '+08:00'},{name: 'UTC +09:00', val: '+09:00'},{name: 'UTC +09:30', val: '+09:30'},{name: 'UTC +10:00', val: '+10:00'},{name: 'UTC +11:00', val: '+11:00'},{name: 'UTC +12:00', val: '+12:00'},{name: 'UTC +13:00', val: '+13:00'},{name: 'UTC +14:00', val: '+14:00'}]
	};
	var publicFunctions = {
		init: init,
		getData: getData,
		setData: setData,
		emptyUserData: emptyUserData,
		getAudiences: getAudiences,
		getSubjectMatters: getSubjectMatters,
		loadTags: loadTags,
		getTagsForSave: getTagsForSave,
		selectCategories: selectCategories,
		selectForms: selectForms,
		selectSubjectMatters: selectSubjectMatters,
		selectAudiences: selectAudiences,
		selectParentCategory: selectParentCategory,
		showDeleteFileModal: showDeleteFileModal,
		setFilesOrder: setFilesOrder
	};
	_.assign(self, defaults, publicVars, publicFunctions);


	init();


	function init(){
		self.inited = Api.options();
		self.inited.then(setData).then(function(){
			self.isInited = true;
		});
	};


	function getData(key, defaultVal){
		var result = self[key];
		defaultVal && !result && (result = defaultVal);
		return result;
	};


	function setData(data, key){
		if(key){
			self[key] = data;
		}else{
			_.forEach(data, function(val, key){
				self[key] = val;
			});
		}
	};


	function emptyUserData(){
		_.assign(self, defaults);
	};


	function wrapInited(sync, cb, args){
		if(sync){
			return cb.apply(this, args);
		}

		return self.inited.then(function(){
			return cb.apply(this, args);
		});
	};


	function getAudiences(sync){
		var cb = function(){
			return self.audienceOptions;
		};
		return wrapInited(sync, cb);
	};


	function getSubjectMatters(sync){
		var cb = function(){
			return self.subjectMatterOptions;
		};
		return wrapInited(sync, cb);
	};


	function selectCategories(deferFn, categoryType){
		var scope = this;

		function onSelect(item, index){
			scope.input.categories = RightList.getSelected()['items'];
			scope.input.categoriesStr = __.arrToStr(scope.input.categories);
		};

		function onEdit(item, index){
			Modal.confirmLeaveModal(scope, function(){
				return scope.go('categories.profile', {categoryType: categoryType, categoryId: item.id});
			});
		};

		function onAdd(){
			Modal.confirmLeaveModal(scope, function(){
				return scope.go('categories.add', {categoryType: categoryType});
			});
		};

		var opts = {
			title: 'Categories',
			multiselect: true,
			showAddBtn: true,
			changeable: true,
			editable: true,
			showLogo: false,
			treeView: true,
			treeNodeFieldName: 'categories',
			onSelect: onSelect,
			onEdit: onEdit,
			onAdd: onAdd
		};
		var idRL = RightList.setDefaults(opts);
		RightList.showLoader().show();

		function onSuccess(resp){
			if(idRL !== RightList.getUniqueId()) return;
			var items = __.getObjVal(resp, 'data', []);
			var selectedItems = __.getObjVal(scope, 'input.categories', []);
			RightList.setItems(items).setSelectedItems(selectedItems);
		};

		function apiReq(){
			Api.categories(categoryType, 'tree').then(onSuccess).finally(RightList.hideLoader);
		};

		deferFn ? deferFn().then(apiReq) : apiReq();
	};


	function selectForms(deferFn){
		var scope = this;

		function onSelect(item, index){
			scope.input.forms = RightList.getSelected()['items'];
			scope.input.formsStr = __.arrToStr(scope.input.forms, 'title');
		};

		function onEdit(item, index){
			Modal.confirmLeaveModal(scope, function(){
				return scope.go('forms.view', {formId: item.id});
			});
		};

		function onAdd(){
			Modal.confirmLeaveModal(scope, function(){
				return scope.go('forms.add');
			});
		};

		var opts = {
			title: 'Forms',
			multiselect: true,
			showAddBtn: true,
			changeable: true,
			editable: true,
			showLogo: false,
			nameFields: ['title'],
			onSelect: onSelect,
			onEdit: onEdit,
			onAdd: onAdd
		};
		var idRL = RightList.setDefaults(opts);
		RightList.showLoader().show();

		function onSuccess(resp){
			if(idRL !== RightList.getUniqueId()) return;
			var items = __.getObjVal(resp, 'data', []),
			    selectedItems = __.getObjVal(scope, 'input.forms', []);
			RightList.setItems(items).setSelectedItems(selectedItems);
		};

		function apiReq(){
			Api.forms().then(onSuccess).finally(RightList.hideLoader);
		};

		deferFn ? deferFn().then(apiReq) : apiReq();
	};


	function selectSubjectMatters(deferFn){
		var scope = this;
		function onSelect(item, index){
			scope.input.smOptions = RightList.getSelected()['items'];
			scope.input.subjectMattersStr = __.arrToStr(scope.input.smOptions);
		};

		var opts = {
			title: 'Subject Matters',
			multiselect: true,
			showAddBtn: false,
			changeable: true,
			editable: false,
			showLogo: false,
			onSelect: onSelect
		};
		var idRL = RightList.setDefaults(opts);
		RightList.showLoader().show();

		function onSuccess(resp){
			if(idRL !== RightList.getUniqueId()){
				return RightList.hideLoader();
			}
			var selectedItems = __.getObjVal(scope, 'input.smOptions', []),
			    allSubjectMatters = getSubjectMatters('sync');
			RightList.setItems(allSubjectMatters).setSelectedItems(selectedItems).hideLoader();
		};

		if(deferFn){
			deferFn().then(onSuccess);
		}else{
			onSuccess({data: __.getObjVal(scope, 'input.smOptions', [])});
		}
	};


	function selectAudiences(deferFn){
		var scope = this;
		function onSelect(item, index){
			scope.input.audienceOptions = RightList.getSelected()['items'];
			scope.input.audiencesStr = __.arrToStr(scope.input.audienceOptions);
		};

		var opts = {
			title: 'Audiences',
			multiselect: true,
			showAddBtn: false,
			changeable: true,
			editable: false,
			showLogo: false,
			onSelect: onSelect
		};
		var idRL = RightList.setDefaults(opts);
		RightList.showLoader().show();

		function onSuccess(resp){
			if(idRL !== RightList.getUniqueId()){
				return RightList.hideLoader();
			}
			var selectedItems = __.getObjVal(scope, 'input.audienceOptions', []),
			    allAudiences = getAudiences('sync');
			RightList.setItems(allAudiences).setSelectedItems(selectedItems).hideLoader();
		};

		if(deferFn){
			deferFn().then(onSuccess);
		}else{
			onSuccess({data: __.getObjVal(scope, 'input.audienceOptions', [])});
		}
	};


	function selectParentCategory(items){
		var scope = this;
		function onSelect(item, index){
			scope.input.groupId = item.id;
			scope.input.parentCategoryStr = item.name;
			this.hide();
		};

		var opts = {
			title: 'Categories',
			items: items,
			showAddBtn: false,
			showLogo: false,
			onSelect: onSelect
		};
		RightList.setDefaults(opts);
		var groupId = __.getObjVal(scope, 'input.groupId');
		RightList.setSelectedItems(groupId).show();
	};


	function getTagsForSave(tags){
		return _.pluck(tags, 'name');
	};


	function loadTags(kw){
		return Api.tags({kw: kw, limit: 100}).then(function(resp){
			return __.getObjVal(resp, 'data', []);
		}, function(){
			return [];
		});
	};


	function showDeleteFileModal(scope, file, index){
		scope.Modal.confirmDelete(scope, 'file', function(){
			var file = __.getObjVal(scope, 'input.files', []);
			file.splice(index, 1);
			scope.showNotify('File successfully deleted', 's', 2);
		}, index);
	};


	function setFilesOrder(files){
		if(!files || typeof files !== 'object') return false;
		_.forEach(files, function(file){
			file._order = file.order || 0;
		});
	};
});
