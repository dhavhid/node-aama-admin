'use strict';

App.controller('UsersCtrl', function($rootScope, $scope, Api, __, $modal, LeftList, Auth, Upload, Data, taApplyCustomRenderers, moment){
	var controllerType = 'users',
	    vars = {},
	    userId = __.stateIntParam('userId');

	$rootScope.$$listeners.$stateChangeStart = [];
	$rootScope.$on('$stateChangeStart', function(event) {
		if ($scope.userForm != undefined) {
			if ($scope.userForm.$pristine === false) {
				if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					event.preventDefault();
				} else {
					$scope.userForm.$setPristine();
				}
			}
		}
	});

	/** $scope **/
		var publicVars = {
			input: {},
			module: {reservations: undefined, registrations: undefined},
			userPermissions: {},
			dropdown: {userOptions: []},
			collapsers: $scope.getCollapsers(controllerType, {information: false, contacts: false, settings: false, dates: false, relatedFiles: false}),
			logoUploader: Upload.getUploader.call($scope, {autoUpload: true}, 'i'),
			fileUploader: Upload.getUploader.call($scope, {autoUpload: true, multiple: true}, '')
		};
		var publicFunctions = {
			showDeleteModal: showDeleteModal,
			save: save,
			prepare: prepare,
			selectAudiences: selectAudiences,
			selectSubjectMatters: selectSubjectMatters,
			selectCategories: selectCategories
		};
		_.assign($scope, publicVars, publicFunctions);

		Upload.bindUploader($scope, $scope.logoUploader, 'logo');
		Upload.bindUploader($scope, $scope.fileUploader, undefined, 'files', true);
	/** --$scope **/


	init();


	function init(){
		initLeftList();
		getUserPermissions();
		initRoute();
	};


	function initRoute(){
		switch(__.stateName()){
			case 'users.add':
				LeftList.selected = {};
				prepare();
				break;
			case 'users.profile':
				getListForSelectedItem().then(function(resp){
					prepare(resp);
					getUserData(true);
				});
				break;
		}
	};


	/* LeftList define */
	function initLeftList(){
		if(LeftList.type === controllerType) return false;

		var opts = {
			type: controllerType,
			title: 'Users list',
			listClass: '',
			filters: {},
			preFiltersTpl: '',
			loadApiMethod: 'users',
			nameFields: ['firstName', 'lastName'],
			defaultLogo: 'images/no-user.png',
			showAddBtn: $scope.userPermissions.add,
			onAdd: onAddLLFn,
			onClick: onClickLLFn,
			module: {}
		};
		LeftList.setDefaults(opts);
		LeftList.load([undefined, LeftList.filters.role]);
		/*if(Auth.isOperationForRolePermitted('view.user', LeftList.filters.role) || userId === Auth.user.id){
			LeftList.load([undefined, LeftList.filters.role]);
		}else{
			LeftList.load([undefined], {data: [Auth.user]});
		}*/
	};

	function onAddLLFn(){
		$scope.go('users.add');
	};

	function onClickLLFn(item, index){
		return $scope.go('users.profile', {userId: item.id});
	};
	/* --LeftList define */


	function getUserPermissions(user){
		user = user || {};
		var up = $scope.userPermissions;

		up.add = true;
		up.edit = true;
		up.delete = true;
		up.hide = true;
		$scope.dropdown.userOptions.deleteByCriteria({id: 'delete'});
		up.delete && $scope.dropdown.userOptions.push({text: lang('Delete user'), click: 'showDeleteModal()', id: 'delete'});

		LeftList.showAddBtn = up.add;
		up = null;
	};


	function getListForSelectedItem(){
		function onSelectCurrent(selectedId){
			return (!userId && selectedId) ? $scope.go('users.profile', {userId: selectedId}, true) : false;
		};

		var id = userId || Auth.user.id,
			listParams = {
				itemId: id,
				onSelectCurrent: onSelectCurrent,
				apiMethod: 'users',
				apiParams: [id],
				notFoundRedirectState: 'users.add',
				notFoundRedirectParams: {}
			};
		(id === Auth.user.id) && (listParams.item = Auth.user);

		var dfd = LeftList.getListForSelectedItem(listParams);
		return dfd;
	};


	function prepare(item){
		if(__.getObjVal(item, 'id')){
			$scope.input = _.assign(_.cloneDeep(item), {audienceOptions: vars.audienceOptions, smOptions: vars.smOptions, categories: vars.categories});
			$scope.input.subjectMattersStr = vars.smOptions ?  __.arrToStr(vars.smOptions) : undefined;
			$scope.input.audiencesStr = vars.audienceOptions ?  __.arrToStr(vars.audienceOptions) : undefined;
			$scope.input.categoriesStr = vars.categories ?  __.arrToStr(vars.categories) : undefined;
		}else{
			$scope.input = {
				isFeatured: false,
				isPrivate: false,
				isVisible: false,
				audienceOptions: [],
				smOptions: [],
				categories: [],
				tags: [],
				order: 1,
				audiencesStr: '',
				subjectMattersStr: '',
				categoriesStr: '',
				publishDate: moment().toISOString()
			};
		}
		!$scope.input.data && ($scope.input.data = {});
		Data.setFilesOrder($scope.input.files);
		getUserPermissions($scope.input);
		$scope.setInputWatcher();
	};


	function showDeleteModal(){
		var item = item || $scope.input;
		if(!item.id) return;
		if(item.id === Auth.user.id){
			$scope.modal.$modal = $modal({
				title: lang('Error'),
				content: lang('You can\'t delete yourself'),
				show: true,
				html: false
			});
			return false;
		}
		$scope.Modal.confirmDelete($scope, 'user', deleteItem, item);
	};


	function getUserData(force){
		if(!userId) return false;
		if(force || !vars.contentsDataDfd){
			var requestedContentId = userId;
			vars.contentsDataDfd = Api.users(userId);
			vars.contentsDataDfd.then(function(resp){
				if(requestedContentId !== userId) return;
				processUserData(resp);
				$scope.setInputWatcher();
			});
		}
		return vars.contentsDataDfd;
	};


	function processUserData(data){
		var audienceOptions = __.getObjVal(data, 'audienceOptions', []);
		$scope.input.audienceOptions = audienceOptions;
		$scope.input.audiencesStr = __.arrToStr($scope.input.audienceOptions);
		vars.audienceOptions = _.cloneDeep(audienceOptions);

		var smOptions = __.getObjVal(data, 'smOptions', []);
		$scope.input.smOptions = smOptions;
		$scope.input.subjectMattersStr = __.arrToStr($scope.input.smOptions);
		vars.smOptions = _.cloneDeep(smOptions);

		var categories = __.getObjVal(data, 'categories', []);
		$scope.input.categories = categories;
		$scope.input.categoriesStr = __.arrToStr($scope.input.categories);
		vars.categories = _.cloneDeep(categories);
	};


	function getDeferFnForSelectors(){
		return userId ? getUserData : null;
	};


	function selectCategories(){
		Data.selectCategories.call($scope, getDeferFnForSelectors(), 'user');
	};


	function selectAudiences(){
		Data.selectAudiences.call($scope, getDeferFnForSelectors());
	};


	function selectSubjectMatters(){
		Data.selectSubjectMatters.call($scope, getDeferFnForSelectors());
	};


	function deleteItem(item){
		item = item || $scope.input;
		if(__.getObjVal(item, 'id', 0) === Auth.user.id) return false;
		var redirectCb = function(newId){$scope.go('users.profile', {userId: newId});};
		$scope.deleteItem(item, 'userDelete', controllerType, redirectCb, lang('User successfully deleted'));
	};


	function save(){
		if(Api.activeReqs.userUpdate || Api.activeReqs.userCreate) return false;
		var cb, req,
		    wysiwygBio = __.getObjVal($scope, 'input.data.wysiwygBio');
		$scope.input.bio = wysiwygBio ? taApplyCustomRenderers(wysiwygBio) : '';
		$scope.input.tags = Data.getTagsForSave($scope.input.tags);
		LeftList.deactivate();

		if(userId){
			cb = function(resp){
				$scope.showNotify(lang('User successfully updated'), 's', 3);
				(resp.id === Auth.user.id) && Auth.setUser(resp);
				if(LeftList.type !== controllerType) return;
				(resp.id === $scope.input.id) && prepare(resp);
				processUserData(resp);
				LeftList.updateItemById(userId, resp);
				/*if(LeftList.filters.role === resp.role){
					!LeftList.getItemById(resp.id) && LeftList.addItem(resp);
				}else{
					LeftList.removeItemById(resp.id);
				}*/
			};
			!$scope.input.password && delete($scope.input.password);
			var req = Api.userUpdate(userId, $scope.input);
		}else{
			cb = function(resp){
				$scope.showNotify(lang('User successfully added'), 's', 3);
				if(LeftList.type !== controllerType) return;
				if(LeftList.filters.role === resp.role){
					LeftList.addItem(resp);
					$scope.go('users.profile', {userId: resp.id});
				}
			};
			req = Api.userCreate($scope.input);
		}

		req.then(cb).finally(LeftList.activate);
	};
});
