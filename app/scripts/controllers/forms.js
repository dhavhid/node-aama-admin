'use strict';

App.controller('FormsCtrl', function($rootScope, $scope, __, LeftList, Api){
	var controllerType = 'forms',
	    vars = {},
	    formId = __.stateIntParam('formId');

	$rootScope.$$listeners.$stateChangeStart = [];
	$rootScope.$on('$stateChangeStart', function(event) {
		if ($scope.formForm != undefined) {
			if ($scope.formForm.$pristine === false) {
				if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					event.preventDefault();
				} else {
					$scope.formForm.$setPristine();
				}
			}
		}
	});

	/** $scope **/
		var publicVars = {
			input: {},
			module: {formId: formId},
			userPermissions: {},
			dropdown: {formOptions: []},
			collapsers: $scope.getCollapsers(controllerType, {information: false, settings: false})
		};
		var publicFunctions = {
			showDeleteModal: showDeleteModal,
			prepare: prepare,
			save: save
		};
		_.assign($scope, publicVars, publicFunctions);
	/** --$scope **/

	init();


	function init(){
		initLeftList();
		getUserPermissions();

		switch(__.stateName()){
			case 'forms.add':
				LeftList.selected = {};
				prepare();
				break;
			case 'forms.view':
				getListForSelectedItem().then(function(resp){
					prepare(resp);
					if(formId){
						getFormData(true);
					}
				});
				break;
		}
	};


	function getUserPermissions(form){
		form = form || {};
		var up = $scope.userPermissions;

		up.add = true;
		up.edit = true;
		up.delete = true;

		$scope.dropdown.formOptions.deleteByCriteria({id: 'delete'});
		up.delete && $scope.dropdown.formOptions.push({text: lang('Delete form'), click: 'showDeleteModal()', id: 'delete'});
		LeftList.showAddBtn = up.add;
		up = null;
	};


	/* LeftList define */
	function initLeftList(){
		if(LeftList.type === controllerType) return;

		var opts = {
			type: controllerType,
			title: 'Forms list',
			loadApiMethod: 'forms',
			nameFields: ['title'],
			showAddBtn: true,
			showLogo: false,
			onAdd: onAddLLFn,
			onClick: onClickLLFn,
			module: {formsList: []}
		};
		LeftList.setDefaults(opts);
		LeftList.load();
	};


	function onAddLLFn(){
		$scope.go('forms.add');
	};

	function onClickLLFn(item, index){
		return $scope.go('forms.view', {formId: item.id});
	};
	/* --LeftList define */


	function getListForSelectedItem(){
		function onSelectCurrent(selectedId){
			return (!formId && selectedId) ? $scope.go('forms.view', {formId: selectedId}, true) : false;
		};
		var listParams = {
			itemId: formId,
			onSelectCurrent: onSelectCurrent,
			apiMethod: 'forms',
			apiParams: [formId],
			notFoundRedirectState: 'forms.add'
		};
		return LeftList.getListForSelectedItem(listParams);
	};


	function prepare(item){
		if(__.getObjVal(item, 'id')){
			$scope.input = _.cloneDeep(item);
		}else{
			$scope.input = {};
		}
		!$scope.input.formItems && ($scope.input.formItems = []);
		$scope.FormBuilder.linkItems($scope.input.formItems);

		$scope.setInputWatcher();
	};


	function showDeleteModal(){
		$scope.Modal.confirmDelete($scope, 'form', deleteItem);
	};


	function deleteItem(item){
		item = item || $scope.input;
		var redirectCb = function(newId){$scope.go('forms.view', {formId: newId});};
		$scope.deleteItem(item, 'formDelete', controllerType, redirectCb, lang('Form successfully deleted'));
	};


	function save(){
		if(Api.activeReqs.formUpdate || Api.activeReqs.formCreate) return false;

		if(!$scope.formForm.formTitle.$valid){
			return $scope.showNotify('Enter valid title', 'e', 3);
		}else if(!$scope.formForm.formEmail.$valid){
			return $scope.showNotify('Enter valid email', 'e', 3);
		};

		var cb, req;
		LeftList.deactivate();
		if(formId){
			req = Api.formUpdate(formId, $scope.input);
			cb = function(resp){
				$scope.showNotify(lang('Form successfully updated'), 's', 2);
				if(LeftList.type !== controllerType) return;
				(resp.id === $scope.input.id) && prepare(resp);
				LeftList.updateItemById(formId, resp);
			};
		}else{
			req = Api.formCreate($scope.input);
			cb = function(resp){
				$scope.showNotify(lang('Form successfully added'), 's', 2);
				if(LeftList.type !== controllerType) return;
				LeftList.addItem(resp);
				$scope.go('forms.view', {formId: resp.id});
			};
		}
		req.then(cb).finally(LeftList.activate);
	};


	function getFormData(force){
		if(force || !vars.formsDataDfd){
			var requestedFormId = formId;
			vars.formsDataDfd = Api.forms(formId);
			vars.formsDataDfd.then(function(resp){
				if(requestedFormId !== formId) return;
				$scope.setInputWatcher();
			});
		}
		return vars.formsDataDfd;
	};
});
