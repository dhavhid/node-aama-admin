'use strict';

window.App = angular.module('aama', [
	'ngResource',
	'ngSanitize',
	'ngAnimate',
	'gettext',
	'angular-toArrayFilter',
	'permission',
	'ui.router',
	'swipe',
	'angularFileUpload',
	'mgcrea.ngStrap',
	'colorpicker.module',
	'pouchdb',
	'ngTagsInput',
	'ui.tree',
	'textAngular',
	'localytics.directives',
	'LocalStorageModule'/*
	'ngWYSIWYG',
	'ngCkeditor'*/
]).config(function($provide){
	$provide.decorator('$exceptionHandler', function($delegate, $window){
		return function(exception, cause){
			$delegate(exception, cause);
			$window.log && log(exception.stack, exception.message);
		};
	});
}).config(function(localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('aama');
}).config(function($compileProvider, $locationProvider, $httpProvider, $provide){
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|ghttps?|ms-appx|x-wmapp0):/);
	// images path for stupid IE on WP8
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|x-wmapp0):|data:image\/)/);

	$locationProvider.html5Mode(!!window.globalVars.html5mode).hashPrefix('!');

	// disable IE ajax request caching, need If-Modified-Since in CORS allowedHeaders server config http://stackoverflow.com/questions/16971831/better-way-to-prevent-ie-cache-in-angularjs
	!$httpProvider.defaults.headers.get && ($httpProvider.defaults.headers.get = {});
	$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

	$httpProvider.interceptors.push(['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {
		$rootScope.loading = {msg: 'Loading...', activeRequests: 0};
		var activeRequests = 0;

		function countRequests(dif){
			activeRequests += dif;
			$timeout(function(){
				$rootScope.loading.activeRequests = activeRequests;
			});
		};

		return {
			request: function(config) {
				countRequests(1);
				return config || $q.when(config);
			},
			response: function(response) {
				countRequests(-1);
				return response || $q.when(response);
			},
			responseError: function(rejection) {
				countRequests(-1);
				return $q.reject(rejection);
			}
		};
	}]);


	//Scroll to the view top
	$provide.decorator('$uiViewScroll', function(){
		return function(uiViewElement){
			//window.scrollTo(0, 0);
		};
	});
}).config(function($modalProvider, $timepickerProvider, $datepickerProvider, tagsInputConfigProvider){
	_.assign($modalProvider.defaults, {
		animation: 'am-fade',
		backdrop: true,
		placement: 'center'
	});
	_.assign($timepickerProvider.defaults, {
		minuteStep: 5,
		length: 12,
		autoclose: false,
		useNative: true,
		iconUp: 'icon-chevron-up',
		iconDown: 'icon-chevron-down',
		trigger: 'focus',
		placement: 'bottom-right',
		container: 'body',
		timeFormat: 'shortTime',
		roundDisplay: true,
		arrowBehavior: 'picker'
	});
	_.assign($datepickerProvider.defaults, {
		dateFormat: 'dd/MM/yyyy',
		startWeek: 0,
		autoclose: true,
		useNative: true,
		iconLeft: 'icon-chevron-left',
		iconRight: 'icon-chevron-right',
		trigger: 'focus',
		placement: 'bottom-right',
		container: 'body'
	});

	tagsInputConfigProvider.setDefaults('tagsInput', {
		replaceSpacesWithDashes: false,
		minLength: 1,
		displayProperty: 'name',
		removeTagSymbol: ''
	});
	tagsInputConfigProvider.setDefaults('autoComplete', {
		maxResultsToShow: 1000,
		loadOnFocus: true,
		minLength: 2
	});
}).factory('moment', function() {
	return window.moment;
}).run(function($rootScope, $state, __, Config){
	$rootScope.$state = $state;
	$rootScope.Config = _.extend(Config, Config[Config.config]);
	FastClick.attach(document.body);

	if(document.documentMode){
		$rootScope.isIE = true;
		angular.element(document.body).addClass('ie');
	}

	var removeFileOverClassTO = null;

	angular.element(document.body).on('dragover', function(event){
		var transfer = event.dataTransfer || __.getObjVal(event, 'originalEvent.dataTransfer') || {},
		    types = __.getObjVal(transfer, 'types', []),
		    isFile = false;

		if(types){
			for(var i = 0; i < types.length; i++){
				if(types[i] === "Files"){
					isFile = true;
					break;
				}
			}
		}

		if(isFile){
			removeFileOverClassTO && clearTimeout(removeFileOverClassTO);
			angular.element(document.body).addClass('file-over');
		}else{
			angular.element(document.body).removeClass('file-over');
			angular.element(document.querySelectorAll('.nv-file-over')).removeClass('nv-file-over');
		}
	});

	angular.element(document.body).on('drop dragend dragleave', function(){
		removeFileOverClassTO && clearTimeout(removeFileOverClassTO);
		removeFileOverClassTO = setTimeout(function(){
			angular.element(document.body).removeClass('file-over');
			angular.element(document.querySelectorAll('.nv-file-over')).removeClass('nv-file-over');
		}, 100);
	});


	//Scroll to invalid fields with header offset
	var scrollToInvalidTO;
	document.addEventListener('invalid', function(e){
		var el = e.target;
		if(!el || !el.getBoundingClientRect || scrollToInvalidTO) return false;
		var elTop = el.getBoundingClientRect().top + window.scrollY;
		window.scrollTo(0, elTop - 100);

		scrollToInvalidTO = setTimeout(function(){
			scrollToInvalidTO = null;
		}, 200);
		//el.scrollIntoView(false);
	}, true);
});
