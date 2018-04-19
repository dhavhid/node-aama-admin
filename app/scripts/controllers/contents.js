'use strict';

App.controller('ContentsCtrl', function($rootScope, $scope, Api, __, LeftList, Upload, Data, Contents, taApplyCustomRenderers, moment, localStorageService, localStorageDriver){
	var contentType = __.stateParam('contentType'),
	    controllerType = 'contents-' + contentType,
	    vars = {},
	    contentId = __.stateIntParam('contentId');

	$rootScope.$$listeners.$stateChangeStart = [];
	$rootScope.$on('$stateChangeStart', function(event) {
		if ($scope.pageForm != undefined) {
			if ($scope.pageForm.$pristine === false) {
				if (!confirm("You have unsaved changes. Are you sure you want to leave this page?")) {
					event.preventDefault();
				} else {
					$scope.pageForm.$setPristine();
				}
			}
		}
	});

	$scope.$watch('LeftList.items', function() {
		if (contentType == 'static_page' || contentType == 'news') {
			if (contentType == 'static_page') {
				var pages = _.map(LeftList.items, function(o) { return {slug: o.slug, title: o.title}; });
				localStorageService.set('pages', pages);
			}
			if (contentType == 'news') {
				var news = _.map(LeftList.items, function(o) { return {id: o.id, title: o.title}; });
				localStorageService.set('news', news);
			}
		}
	});

	/** $scope **/
		var publicVars = {
			specificFields: __.getObjVal(Contents.specificFields, [contentType], {}),
			input: {},
			module: {contentId: contentId, contentType: contentType},
			userPermissions: {},
			dropdown: {contentOptions: []},
			users: [],
			collapsers: $scope.getCollapsers(controllerType, {information: false, contacts: true, social: false, settings: false, relatedFiles: false, revisions: false, dates: false}),
			featuredImageUploader: Upload.getUploader.call($scope, {autoUpload: true, multiple: true}, 'i'),
			featuredImageUploader2: Upload.getUploader.call($scope, {autoUpload: true, multiple: true}, 'i'),
			featuredImageUploader3: Upload.getUploader.call($scope, {autoUpload: true, multiple: true}, 'i'),
			fileUploader: Upload.getUploader.call($scope, {autoUpload: true, multiple: true}, __.getObjVal(Contents, ['fileUploaderFilter', contentType], ''))
		};
		var publicFunctions = {
			showDeleteModal: showDeleteModal,
			save: save,
			prepare: prepare,
			selectForms: selectForms,
			selectAudiences: selectAudiences,
			selectSubjectMatters: selectSubjectMatters,
			selectCategories: selectCategories,
			revert: revert
		};
		_.assign($scope, publicVars, publicFunctions);
		var req = Api.users();
		req.then(function(resp){
			_.forEach(resp.data, function(d, index){
				$scope.users.push({id: d.id, name: d.firstName + ' ' + d.lastName});
			});
		},function(err){});

		Upload.bindUploader($scope, $scope.featuredImageUploader, 'featuredImage');
		Upload.bindUploader($scope, $scope.featuredImageUploader2, 'featuredImage2');
		Upload.bindUploader($scope, $scope.featuredImageUploader3, 'featuredImage3');
		Upload.bindUploader($scope, $scope.fileUploader, undefined, 'files', true);
	/** --$scope **/

	init();


	function init(){
		$scope.global.menuItem = (_.find(Contents.types, {name: contentType}) || {}).title;

		initLeftList();
		getUserPermissions();

		switch(__.stateName()){
			case 'contents.add':
				LeftList.selected = {};
				prepare();
				break;
			case 'contents.profile':
				getListForSelectedItem().then(function(resp){
					prepare(resp);
					getContentData(true);
				});
				break;
		}
	};


	function getUserPermissions(content){
		content = content || {};
		var up = $scope.userPermissions;

		up.add = true;
		up.edit = true;
		up.delete = true;
		up.audiencesEdit = true;

		$scope.dropdown.contentOptions.deleteByCriteria({id: 'delete'});
		up.delete && $scope.dropdown.contentOptions.push({text: lang('Delete content'), click: 'showDeleteModal()', id: 'delete'});
		LeftList.showAddBtn = up.add;
		up = null;
	};


	/* LeftList define */
	function initLeftList(){
		if(LeftList.type === controllerType) return;

		var opts = {
			type: controllerType,
			title: 'Messages list',
			loadApiMethod: 'contents',
			showAddBtn: true,
			nameFields: ['title'],
			thumbFields: ['images', 'featuredImage', 'data', 'thumb'],
			showLogo: $scope.specificFields.featuredImage,
			onAdd: onAddLLFn,
			onClick: onClickLLFn,
			module: {contentsList: []}
		};
		LeftList.setDefaults(opts);
		LeftList.load([contentType]);
	};


	function onAddLLFn(){
		$scope.go('contents.add');
	};

	function onClickLLFn(item, index){
		return $scope.go('contents.profile', {contentId: item.id});
	};
	/* --LeftList define */


	function getListForSelectedItem(){
		function onSelectCurrent(selectedId){
			return (!contentId && selectedId) ? $scope.go('contents.profile', {contentType: contentType, contentId: selectedId}, true) : false;
		};
		var listParams = {
			itemId: contentId,
			onSelectCurrent: onSelectCurrent,
			apiMethod: contentId ? 'contents' : null,
			apiParams: [contentId, contentType],
			notFoundRedirectState: 'contents.add'
		};
		return LeftList.getListForSelectedItem(listParams);
	};


	function prepare(item){
		if(__.getObjVal(item, 'id')){
			$scope.input = _.assign(_.cloneDeep(item), {audienceOptions: vars.audienceOptions, smOptions: vars.smOptions, forms: vars.forms, categories: vars.categories});
			$scope.input.subjectMattersStr = vars.smOptions ?  __.arrToStr(vars.smOptions) : undefined;
			$scope.input.audiencesStr = vars.audienceOptions ?  __.arrToStr(vars.audienceOptions) : undefined;
			$scope.input.formsStr = vars.forms ?  __.arrToStr(vars.forms, 'title') : undefined;
			$scope.input.categoriesStr = vars.categories ?  __.arrToStr(vars.categories) : undefined;
			$scope.input.relatedContent = item.relatedContent != undefined && item.relatedContent != null ? item.relatedContent.split(',') : [];
			if ($scope.input.relatedContent.length > 0) {
				_.forEach($scope.input.relatedContent, function(item, index) {
					$scope.input.relatedContent[index] = parseInt($scope.input.relatedContent[index]);
				});
			}
			if ($scope.input.author == 0 || $scope.input.author == null || $scope.input.author == undefined) {
				var usr = localStorageDriver.get('user');
				$scope.input.author = parseInt(usr.id);
			}
		}else{
			$scope.input = {
				isFeatured: false,
				isPrivate: false,
				isVisible: false,
				isMembersOnly: false,
				audienceOptions: [],
				smOptions: [],
				forms: [],
				categories: [],
				order: 1,
				tags: [],
				audiencesStr: '',
				subjectMattersStr: '',
				categoriesStr: '',
				formsStr: '',
				publishDate: moment().toISOString(),
				galleryType: 'image',
				files: []
			};
		}

		getRevisions();
		Data.setFilesOrder($scope.input.files);
		$scope.setInputWatcher();
	};


	function showDeleteModal(){
		$scope.Modal.confirmDelete($scope, 'content', deleteItem);
	};


	function deleteItem(item){
		item = item || $scope.input;
		var redirectCb = function(newId){$scope.go('contents.profile', {contentId: newId});};
		$scope.deleteItem(item, 'contentDelete', controllerType, redirectCb, lang('Item successfully deleted'));
	};


	function getRevisions(){
		if(!contentId) return false;
		Api.revisions(contentId).then(function(resp){
			$scope.revisions = __.getObjVal(resp, 'data', []);
		});
	};


	function save(){
		if(Api.activeReqs.contentUpdate || Api.activeReqs.contentCreate) return false;
		var cb, req,
		    wysiwygContent = __.getObjVal($scope, 'input.wysiwygContent');
		$scope.input.content = wysiwygContent ? taApplyCustomRenderers(wysiwygContent) : '';
		$scope.input.tags = Data.getTagsForSave($scope.input.tags);
		if ($scope.input.relatedContent.length > 0) {
			$scope.input.relatedContent = $scope.input.relatedContent.join(',');
		} else $scope.input.relatedContent = null;
		if ($('select[name="parentPage"]')) {
			if ($('select[name="parentPage"]').val() == '') {
				$scope.input.parentPage = null;
			}
		}
		LeftList.deactivate();

		if(contentId){
			req = Api.contentUpdate(contentId, $scope.input);
			cb = function(resp){
				$scope.showNotify(lang('Item successfully updated'), 's', 2);
				if(LeftList.type !== controllerType) return;
				(resp.id === $scope.input.id) && prepare(resp);
				processContentData(resp);
				LeftList.updateItemById(contentId, resp);
			};
		}else{
			req = Api.contentCreate($scope.input, contentType);
			cb = function(resp){
				$scope.showNotify(lang('Item successfully added'), 's', 2);
				if(LeftList.type !== controllerType) return;
				LeftList.addItem(resp);
				$scope.go('contents.profile', {contentId: resp.id});
			};
		}
		$scope.pageForm.$setPristine();
		req.then(cb).finally(LeftList.activate);
	};


	function getContentData(force){
		if(!contentId) return false;
		if(force || !vars.contentsDataDfd){
			var requestedContentId = contentId;
			vars.contentsDataDfd = Api.content(contentId);
			vars.contentsDataDfd.then(function(resp){
				if(requestedContentId !== contentId) return;
				processContentData(resp);
				$scope.setInputWatcher();
			});
		}
		return vars.contentsDataDfd;
	};


	function processContentData(data){
		var audienceOptions = __.getObjVal(data, 'audienceOptions', []);
		$scope.input.audienceOptions = audienceOptions;
		$scope.input.audiencesStr = __.arrToStr($scope.input.audienceOptions);
		vars.audienceOptions = _.cloneDeep(audienceOptions);

		var smOptions = __.getObjVal(data, 'smOptions', []);
		$scope.input.smOptions = smOptions;
		$scope.input.subjectMattersStr = __.arrToStr($scope.input.smOptions);
		vars.smOptions = _.cloneDeep(smOptions);

		var forms = __.getObjVal(data, 'forms', []);
		$scope.input.forms = forms;
		$scope.input.formsStr = __.arrToStr($scope.input.forms, 'title');
		vars.forms = _.cloneDeep(forms);

		var categories = __.getObjVal(data, 'categories', []);
		$scope.input.categories = categories;
		$scope.input.categoriesStr = __.arrToStr($scope.input.categories);
		vars.categories = _.cloneDeep(categories);
	};


	function getDeferFnForSelectors(){
		return contentId ? getContentData : null;
	};


	function selectForms(){
		Data.selectForms.call($scope, getDeferFnForSelectors());
	};


	function selectAudiences(){
		Data.selectAudiences.call($scope, getDeferFnForSelectors());
	};


	function selectSubjectMatters(){
		Data.selectSubjectMatters.call($scope, getDeferFnForSelectors());
	};


	function selectCategories(){
		Data.selectCategories.call($scope, getDeferFnForSelectors(), contentType);
	};


	function revert(revisionNumber){
		if(!contentId || !revisionNumber) return false;
		Api.revert(contentId, revisionNumber).then(function(resp){
			prepare(resp);
			getContentData(true);
		});
	};
});
