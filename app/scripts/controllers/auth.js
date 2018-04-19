'use strict';

App.controller('AuthCtrl', function($scope, Auth, Data, Api, __){
	var resetToken = __.stateParam('resetToken');

	/** $scope **/
		var publicVars = {
			input: {email: 'user@aamanet.org', token: resetToken}, //TODO: remove in production
			module: {showResetTokenField: !resetToken}
		};
		var publicFunctions = {
			login: login,
			passwordRestore: passwordRestore,
			passwordReset: passwordReset
		};
		_.assign($scope, publicVars, publicFunctions);
	/** --$scope **/


	function login(){
		Auth.login($scope.input.email, $scope.input.password).then(function(resp){
			Data.init();
			$scope.go('users.profile');
		});
	};


	function passwordRestore(){
		Api.passwordRestore($scope.input.email).then(function(resp){
			if(__.getObjVal(resp, 'success')){
				$scope.showNotify('Check the email', 's', 3);
				$scope.go('password.reset');
			}
		});
	};


	function passwordReset(){
		Api.passwordReset($scope.input.token, $scope.input.password).then(function(resp){
			if(__.getObjVal(resp, 'success')){
				$scope.showNotify('Password successfully changed', 's', 3);
				$scope.go('login');
			}
		});
	};
});
