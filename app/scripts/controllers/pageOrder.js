'use strict';

App.controller('PageOrderCtrl', function($scope, Api, __){
	/** $scope **/
	var publicVars = {
		input: {pages: []}
	};
	var publicFunctions = {
		save: save,
		prepare: prepare
	};
	_.assign($scope, publicVars, publicFunctions);
	/** --$scope **/


	init();


	function init(){
		getListItems().then(function(resp){
			prepare(__.getObjVal(resp, 'data', []));
		});
	};


	function getListItems(){
		return Api.contents('static_page', 'tree');
	};


	function prepare(list){
		$scope.unpreparedItem = _.cloneDeep(list || {});
		$scope.input.pages.length = 0;
		prepareList(list);
		Array.prototype.push.apply($scope.input.pages, list);
		$scope.setInputWatcher();
	};


	function prepareList(list){
		_.forEach(list, function(page) {
			if (!page.pages) {
				page.pages = [];
			} else {
				prepareList(page.pages);
			}
		});
	};


	function save(){
		var req = Api.contentOrder({data: $scope.input.pages}, 'static_page');
		req.then(function(resp){
			$scope.showNotify(lang('Order successfully updated'), 's', 2);
			prepare(__.getObjVal(resp, 'data', []));
		});
	};
});
