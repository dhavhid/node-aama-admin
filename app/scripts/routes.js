'use strict';
App.config(function($urlRouterProvider, $stateProvider){
	$urlRouterProvider.otherwise(function($injector){
		var $state = $injector.get('$state');
		$state.go('login');
	});

	var dataSvcResolver = {
		Data: ['Data', function(Data){
			return Data.inited.then(function(){
				return Data;
			}, function(){
				return Data;
			});
		}]
	};

	$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: 'views/pages/login.html',
			controller: 'AuthCtrl',
			data: {
				inactivePageBg: true,
				emptyHeader: true,
				notUseLeftList: true,
				permissions: {
					only: ['guest'],
					redirectTo: 'users.profile'
				}
			}
		})

		.state('password', {
			url: '/password',
			views: {
				'': {template: '<ui-view autoscroll="true" class="view-change anim-fade-in" />'}
			},
			abstract: true
		})
		.state('password.restore', {
			url: '/restore',
			templateUrl: 'views/pages/password.restore.html',
			controller: 'AuthCtrl',
			data: {
				inactivePageBg: true,
				emptyHeader: true,
				notUseLeftList: true,
				permissions: {
					only: ['guest'],
					redirectTo: 'users.profile'
				}
			}
		})
		.state('password.reset', {
			url: '/reset/:resetToken',
			templateUrl: 'views/pages/password.reset.html',
			controller: 'AuthCtrl',
			data: {
				inactivePageBg: true,
				emptyHeader: true,
				notUseLeftList: true,
				permissions: {
					only: ['guest'],
					redirectTo: 'users.profile'
				}
			}
		})

		.state('users', {
			url: '/users',
			views: {
				'': {template: '<ui-view autoscroll="true" class="view-change anim-fade-in" />'},
				'list': {templateUrl: 'views/list/leftList.html'}
			},
			abstract: true,
			resolve: dataSvcResolver
		})
		.state('users.add', {
			url: '/add/:role/:entityId',
			controller: 'UsersCtrl',
			templateUrl: 'views/pages/users.html',
			data: {
				menuItem: 'Users',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})
		.state('users.profile', {
			url: '/:userId',
			controller: 'UsersCtrl',
			templateUrl: 'views/pages/users.html',
			data: {
				menuItem: 'Users',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})

		.state('categories', {
			url: '/categories/:categoryType',
			views: {
				'': {template: '<ui-view autoscroll="true" class="view-change anim-fade-in" />'},
				'list': {templateUrl: 'views/list/leftList.html'}
			},
			abstract: true,
			resolve: dataSvcResolver
		})
		.state('categories.add', {
			url: '/add',
			controller: 'CategoriesCtrl',
			templateUrl: 'views/pages/categories.html',
			data: {
				menuItem: 'Categories',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})
		.state('categories.profile', {
			url: '/:categoryId',
			controller: 'CategoriesCtrl',
			templateUrl: 'views/pages/categories.html',
			data: {
				menuItem: 'Categories',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})

		.state('contents', {
			url: '/contents/:contentType',
			views: {
				'': {template: '<ui-view autoscroll="true" class="view-change anim-fade-in" />'},
				'list': {templateUrl: 'views/list/leftList.html'}
			},
			abstract: true,
			resolve: dataSvcResolver
		})
		.state('contents.add', {
			url: '/add',
			controller: 'ContentsCtrl',
			templateUrl: 'views/pages/contents.html',
			data: {
				menuItem: 'Contents',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})
		.state('contents.profile', {
			url: '/:contentId',
			controller: 'ContentsCtrl',
			templateUrl: 'views/pages/contents.html',
			data: {
				menuItem: 'Contents',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})

		.state('pageOrganization', {
			url: '/page-organization',
			templateUrl: 'views/pages/pageOrder.html',
			controller: 'PageOrderCtrl',
			data: {
				notUseLeftList: true,
				menuItem: 'Page organization',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})

		.state('forms', {
			url: '/forms',
			views: {
				'': {template: '<ui-view autoscroll="true" class="view-change anim-fade-in" />'},
				'list': {templateUrl: 'views/list/leftList.html'}
			},
			abstract: true,
			resolve: dataSvcResolver
		})
		.state('forms.add', {
			url: '/add',
			controller: 'FormsCtrl',
			templateUrl: 'views/pages/forms.html',
			data: {
				menuItem: 'Forms',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})
		.state('forms.view', {
			url: '/:formId',
			controller: 'FormsCtrl',
			templateUrl: 'views/pages/forms.html',
			data: {
				menuItem: 'Forms',
				permissions: {
					only: ['admin'],
					redirectTo: 'login'
				}
			}
		})
		;
});
