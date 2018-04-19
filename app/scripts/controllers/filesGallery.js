'use strict';

App.controller('FilesGalleryCtrl', function($scope, Api, $timeout, __, $sce){
	var limit = 36,
	    searchTO = null;

	/** $scope **/
		var publicVars = {
			input: {kw: ''},
			module: {selected: {}, count: 0},
			pagination: {pages: 1, page: 1},
			files: undefined
		};
		var publicFunctions = {
			search: search,
			selectFile: selectFile
		};
		_.assign($scope, publicVars, publicFunctions);
	/** --$scope **/

	init();


	function init(){
		getFiles();
	};


	function getFiles(page){
		page = page || $scope.pagination.page;
		$scope.pagination.page = page;
		Api.files(page, limit, $scope.input.kw).then(function(resp){
			$scope.files = __.getObjVal(resp, 'data', []);
			$scope.pagination.count = __.getObjVal(resp, 'count', $scope.files.length);
			processFiles();
			getPagination();
		});
	};


	function search(kw, delay){
		!_.isUndefined(kw) && ($scope.input.kw = kw);
		_.isUndefined(delay) && (delay = 500);
		$timeout.cancel(searchTO);
		searchTO = $timeout(getFiles.bind($scope, 1), delay);
	};


	function processFiles(){
		_.forEach($scope.files, function(file){
			var type = $scope.Upload.getTypeByExt(__.getObjVal(file, 'data.originalFileInfo.ext', '')),
			    embedCode = __.getObjVal(file, 'data.embedCode');
			if(!type){
				type = $scope.Upload.getTypeByExt(file.documentType);
			}
			if(!type){
				type = embedCode ? 'video' : file.documentType;
			}
			file.type = type;

			if(embedCode){
				var embedEl = angular.element('<div>' + embedCode + '</div>'),
				    iframeEl = embedEl.children();

				var src = iframeEl.attr('src').replace('autoplay=1', 'autoplay=0');
				iframeEl.attr({width: '100%', height: '100%', src: src});
				file.data.previewEmbedCode = $sce.trustAsHtml(embedEl.html());
			}
		});
	};


	function getPagination(){
		var pages = Math.ceil($scope.pagination.count / limit);
		$scope.pagination.pages = pages;
		$scope.pagination.next = $scope.pagination.page < pages ? getFiles.bind(this, $scope.pagination.page + 1) : null;
		$scope.pagination.prev = $scope.pagination.page > 1 ? getFiles.bind(this, $scope.pagination.page - 1) : null;
	};


	function selectFile(file){
		if($scope.module.selected[file.id]){
			delete($scope.module.selected[file.id]);
		}else{
			$scope.module.selected[file.id] = file;
		}
	};
});
