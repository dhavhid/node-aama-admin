'use strict';

App.run(function(Permission, Auth, $rootScope){
	$rootScope.userRoles = {guest: 'Guest', admin: 'Administrator'};
	$rootScope.userRolesArr = _.keys($rootScope.userRoles);
	Permission.defineManyRoles($rootScope.userRolesArr, function(stateParams, role){
		return Auth.isUserRole(role, stateParams);
	});
});

App.service('Auth', function(Api, $q, __, Storage, $rootScope, $window, $state){
	var self = this,
	    sessionRequestTime = 0,
	    cachedSessionRequest = null;

	var publicFunctions = {
		isOperationForRolePermitted: isOperationForRolePermitted,
		isOperationPermitted: isOperationPermitted,
		setUser: setUser,
		isUserRole: isUserRole,
		login: login,
		logout: logout,
		checkSession: checkSession
	};
	_.extend(this, publicFunctions);

	setUser(Storage.get('user', {}));


	function setUserRoutePermissions(){
		self.user.routePermissions = {};
		var routes = $state.get();
		_.forEach(routes, function(route){
			var onlyPerm = __.getObjVal(route, 'data.permissions.only'),
			    exceptPerm = __.getObjVal(route, 'data.permissions.except'),
			    stateName = __.getObjVal(route, 'name');

			if(stateName){
				self.user.routePermissions[stateName] = true;
				if(onlyPerm){
					self.user.routePermissions[stateName] = _.contains(onlyPerm, self.user.role);
				}
				if(exceptPerm){
					self.user.routePermissions[stateName] = !_.contains(exceptPerm, self.user.role);
				}
			}
		});
	};


	function setUserOperationsPermissions(){
		self.user.operationsPermissions = {};
		_.forEach(self.user.permissions, function(perm){
			!self.user.operationsPermissions[perm.operation] && (self.user.operationsPermissions[perm.operation] = {});
			self.user.operationsPermissions[perm.operation][perm.object] = perm.restrictions || {};
			self.user.operationsPermissions[perm.operation][perm.object].fields = perm.fields;
		});
	};


	function isOperationForRolePermitted(operation, role){
		(typeof operation === 'string') && (operation = operation.split('.'));
		var fieldSet = _.union(['operationsPermissions'], operation),
		    userOperation = __.getObjVal(self.user, fieldSet);
		if(!userOperation) return false;

		fieldSet.push('accessibleRoles');
		var accessibleRoles = __.getObjVal(self.user, fieldSet, []);

		return !accessibleRoles.length || _.contains(accessibleRoles, role);
	};


	function isOperationPermitted(operation){
		(typeof operation === 'string') && (operation = operation.split('.'));
		var fieldSet = _.union(['operationsPermissions'], operation);
		return !!__.getObjVal(self.user, fieldSet);
	};


	function setUser(data){
		if(!_.isUndefined(data)){
			(!data || !_.isPlainObject(data)) && (data = {});
			setUserRole(data);
			self.user = data;
			Storage.set('user', data);
		}
		setUserRoutePermissions();
		setUserOperationsPermissions();
		$rootScope.authUser = self.user;
		return self.user;
	};


	function isUserRole(role, stateParams){
		if(self.user.role){
			return self.user.role === role;
		}
		if(!self.user.role && role === 'guest') return true;

		var dfd = $q.defer();
		checkSession(1000).then(function(resp){
			if(self.user.role === role){
				dfd.resolve();
			}else{
				role === 'guest' ? dfd.resolve() : dfd.reject();
			}
		}, function(){
			role === 'guest' ? dfd.resolve() : dfd.reject();
		});

		return dfd.promise;
	};


	function setUserRole(user){
		user.role = __.getObjVal(user, 'adminAccess') ? 'admin' : 'guest';
	};


	function login(email, password){
		return Api.login(email, password).then(function(resp){
			return setUser(resp);
		});
	};


	function logout(){
		return Api.logout().then(function(resp){
			return resp;
		}).finally(function(){
			setUser({});
			$window.stateHistory = [];
			return $state.go('login');
		});
	};


	function checkSession(maxRequestCacheAge, showError){
		var now = (new Date()).getTime();

		if(cachedSessionRequest && maxRequestCacheAge && now <= sessionRequestTime + maxRequestCacheAge){
			return cachedSessionRequest;
		}

		sessionRequestTime = now;
		cachedSessionRequest = Api.hideRespErrorsOnce().user();
		cachedSessionRequest.then(function(resp){
			var data = $rootScope.checkErrors(resp, showError) ? {} : _.assign(resp, {role: resp.adminAccess ? 'admin' : 'guest'});
			setUser(data);
		});

		return cachedSessionRequest;
	};
});