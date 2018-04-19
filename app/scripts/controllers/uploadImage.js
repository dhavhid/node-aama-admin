'use strict';

App.controller('UploadImageCtrl', function($scope, Upload, __){
	/** $scope **/
		var publicVars = {
			input: {},
			imageUploader: Upload.getUploader.call($scope, {autoUpload: true, removeAfterUpload: false, multiple: true}, 'i')
		};
		var publicFunctions = {
			removeFileFromQueue: removeFileFromQueue
		};
		_.assign($scope, publicVars, publicFunctions);

		Upload.bindUploader($scope, $scope.imageUploader, 'image', null, true);
	/** --$scope **/

	init();


	function init(){

	};


	function removeFileFromQueue(item, index){
		$scope.imageUploader.removeFromQueue(item);
		var image = __.getObjVal($scope, 'input.images.image', []);
		image = image.splice(image.length - index - 1, 1);
	};
});
