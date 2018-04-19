'use strict';

App.controller('CategoriesCtrl', function($rootScope, $scope, Api, __, LeftList, Data){
	var categoryType = __.stateParam('categoryType'),
	    categoryId = __.stateParam('categoryId', undefined, 'int'),
	    controllerType = 'categories-' + categoryType;

	$rootScope.$$listeners.$stateChangeStart = [];
	$rootScope.$on('$stateChangeStart', function(event) {
		if ($scope.categoriesForm != undefined) {
			if ($scope.categoriesForm.$pristine === false) {
				if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					event.preventDefault();
				} else {
					$scope.categoriesForm.$setPristine();
				}
			}
		}
	});

	/** $scope **/
		var publicVars = {
			input: {},
			module: {categoryId: categoryId, categoryType: categoryType},
			typeTitles: {user: 'Users categories', news: 'News categories', faq: 'FAQ categories'},
			userPermissions: {},
			dropdown: {categoryOptions: []},
			collapsers: $scope.getCollapsers(controllerType, {information: false, settings: false})
		};
		var publicFunctions = {
			showDeleteModal: showDeleteModal,
			save: save,
			prepare: prepare,
			selectParentCategory: selectParentCategory,
			clearParentCategory: clearParentCategory
		};
		_.assign($scope, publicVars, publicFunctions);
	/** --$scope **/

	init();


	function init(){
		$scope.global.menuItem = $scope.typeTitles[categoryType];

		initLeftList();
		getUserPermissions();

		switch(__.stateName()){
			case 'categories.add':
				LeftList.selected = {};
				prepare();
				break;
			case 'categories.profile':
				getListForSelectedItem().then(function(resp){
					prepare(resp);
				});
				break;
		}
	};


	function getUserPermissions(category){
		category = category || {};
		var up = $scope.userPermissions;

		up.add = true;
		up.edit = true;
		up.delete = true;
		up.audiencesEdit = true;

		$scope.dropdown.categoryOptions.deleteByCriteria({id: 'delete'});
		up.delete && $scope.dropdown.categoryOptions.push({text: lang('Delete category'), click: 'showDeleteModal()', id: 'delete'});
		LeftList.showAddBtn = up.add;
		up = null;
	};


	/* LeftList define */
	function initLeftList(){
		if(LeftList.type === controllerType) return false;

		var opts = {
			type: controllerType,
			title: 'Categories list',
			loadApiMethod: 'categories',
			showAddBtn: true,
			showLogo: false,
			onAdd: onAddLLFn,
			onClick: onClickLLFn,
			module: {categoriesList: []}
		};
		LeftList.setDefaults(opts);
		LeftList.load([categoryType]);
	};


	function onAddLLFn(){
		$scope.go('categories.add');
	};

	function onClickLLFn(item, index){
		return $scope.go('categories.profile', {categoryId: item.id});
	};
	/* --LeftList define */


	function getListForSelectedItem(){
		function onSelectCurrent(selectedId){
			return (!categoryId && selectedId) ? $scope.go('categories.profile', {categoryType: categoryType, categoryId: selectedId}, true) : false;
		};
		var listParams = {
			itemId: categoryId,
			onSelectCurrent: onSelectCurrent,
			apiMethod: categoryId ? 'category' : undefined,
			apiParams: categoryId,
			notFoundRedirectState: 'categories.add'
		};
		return LeftList.getListForSelectedItem(listParams);
	};


	function prepare(item){
		if(__.getObjVal(item, 'id')){
			$scope.input = _.cloneDeep(item);
			var parentCategory = __.searchInArrayById(LeftList.items, $scope.input.groupId) || {};
			$scope.input.parentCategoryStr = parentCategory.name || '';
		}else{
			$scope.input = {
				isFeatured: false,
				isPrivate: false,
				isVisible: false,
				order: 1,
				parentCategoryStr: ''
			};
		}

		$scope.setInputWatcher();
	};


	function showDeleteModal(){
		$scope.Modal.confirmDelete($scope, 'category', deleteItem);
	};


	function deleteItem(item){
		item = item || $scope.input;
		var redirectCb = function(newId){$scope.go('categories.profile', {categoryId: newId});};
		$scope.deleteItem(item, 'categoryDelete', controllerType, redirectCb, lang('Item successfully deleted'));
	};


	function save(){
		if(Api.activeReqs.categoryUpdate || Api.activeReqs.categoryCreate) return false;
		var cb, req;
		LeftList.deactivate();

		if(categoryId){
			req = Api.categoryUpdate(categoryId, $scope.input);
			cb = function(resp){
				$scope.showNotify(lang('Item successfully updated'), 's', 2);
				if(LeftList.type !== controllerType) return;
				(resp.id === $scope.input.id) && prepare(resp);
				LeftList.updateItemById(categoryId, resp);
			};
		}else{
			req = Api.categoryCreate($scope.input, categoryType);
			cb = function(resp){
				$scope.showNotify(lang('Item successfully added'), 's', 2);
				if(LeftList.type !== controllerType) return;
				LeftList.addItem(resp);
				$scope.go('categories.profile', {categoryId: resp.id});
			};
		}
		$scope.categoriesForm.$setPristine();
		req.then(cb).finally(LeftList.activate);
	};


	function selectParentCategory(){
		LeftList.loadedDfd.promise.then(function(resp){
			var items = _.cloneDeep(__.getObjVal(resp, 'data', []));
			items = _.filter(items, function(item, idx){
				return (item.id !== $scope.input.id && !item.groupId);
			});
			Data.selectParentCategory.call($scope, items);
		});
	};


	function clearParentCategory(){
		$scope.input.groupId = null;
		$scope.input.parentCategoryStr = '';
	};
});
