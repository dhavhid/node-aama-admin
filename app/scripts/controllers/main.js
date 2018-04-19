'use strict';

App.controller('MainCtrl', function($scope, $timeout, $location, $window, $rootScope, Auth, Storage, __, $state, LeftList, RightList, $aside, Modal, Api, Data, FormBuilder, Contents, Upload){
	var isBack = false,
	    notifyTO = null;

	/** $scope **/
		var publicVars = {
			LeftList: LeftList,
			RightList: RightList,
			FormBuilder: FormBuilder,
			Contents: Contents,
			_: _,
			__: __,
			Modal: Modal,
			Data: Data,
			Upload: Upload,
			Auth: Auth,
			Api: Api,
			currentLang: $window.currentLang,
			lang: $window.lang,
			notify: {msg: '', show: false, type: '', icon: ''},
			global: {isBack: false, stateName: '', menuItem: '', showActionBtns: false},
			loader: {global: false}
		};
		var publicFunctions = {
			go: go,
			getCollapsers: getCollapsers,
			openLink: openLink,
			setInputWatcher: setInputWatcher,
			deleteItem: deleteItem
		};
		var rootPublicVars = {
			authUser: Auth.user,
			global: {showPopupActionBtns: false, useNativePickers: true, isBack: false, stateName: '', bottomButtons: [], isCordova: $window.globalVars.isCordova},
			$state: $state
		};
		var rootPublicFunctions = {
			showReqError: showReqError,
			checkErrors: checkErrors,
			showNotify: showNotify,
			hideNotify: hideNotify
		};
		_.assign($scope, publicVars, publicFunctions);
		_.assign($rootScope, rootPublicVars, rootPublicFunctions);
	/** --$scope **/


	init();


	/* INIT */
	function init(){
		$scope.ckeditorConf = {
			extraPlugins: 'uploadimage',
			filebrowserUploadUrl: $scope.Config.serverUrl,
			extraAllowedContent: 'img[title]'
		};
		Auth.checkSession(null, false);
		initMenu();
		initEvents();
	};


	function initMenu(){
		var menuObj = $aside({
			templateUrl: 'views/components/menu.html',
			placement: 'left',
			animation: 'am-slide-left',
			container: 'body',
			scope: $scope,
			show: false
		});

		$scope.menu = {
			obj: menuObj,
			enable: false,
			active: '',
			toggle: function(state){
				menuObj.$promise.then(function(){
					(typeof state === 'undefined') && (state = !menuObj.$isShown);
					state ? menuObj.show() : menuObj.hide();
				});
			},
			show: menuObj.show,
			hide: menuObj.hide
		};
	};


	function initEvents(){
		var glob = $scope.global;
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			$scope.loader.global = false;
			glob.stateName = toState.name;
			glob.menuItem = toState.data.menuItem;
			$scope.menu.active = toState.menu;
			glob.emptyHeader = !!toState.data.emptyHeader;
			glob.inactivePageBg = !!toState.data.inactivePageBg;
			glob.isBack = isBack;
			glob.showActionBtns = false;
			isBack = false;
		});
	};
	/* --INIT */


	function go(state, params, replace, stateParams){
		var stateResut = $state.go(state, params, stateParams);
		replace && $location.replace();
		return stateResut;
	};


	function showNotify(msg, type, delay){
		type = type || 'info'; // info | error | success
		switch(type){
			case 'i': type = 'info';
			case 'info': $scope.notify.icon = 'icon-info-outline'; break;
			case 'e': type = 'error';
			case 'error': $scope.notify.icon = 'icon-warning'; break;
			case 's': type = 'success';
			case 'success': $scope.notify.icon = 'icon-done'; break;
		}
		delay = delay * 1000 || 0;
		$scope.notify.msg = msg;
		$scope.notify.type = type;
		$scope.notify.show = true;
		notifyTO && $timeout.cancel(notifyTO);
		delay && (notifyTO = $timeout(hideNotify, delay));
	};


	function hideNotify(){
		$scope.notify.show = false;
	};


	function showReqError(err, showDescription){
		err = err || {};
		var msg = '';
		if(__.getObjVal(err, 'data.status') === 'error'){
			msg = __.getObjVal(err, 'data.message');
		}

		var defaultErrText = lang('Request error') + '! ' + lang(err.statusText) + ' [' + lang('Code') + ' ' + err.status + '].';
		msg = lang(msg) || defaultErrText;

		var descr = __.getObjVal(err, 'data.data');
		if(showDescription && descr){
			var msgArr = [];
			if(typeof descr === 'object'){
				for(var i in descr){
					msgArr.push(lang(descr[i]));
				}
			}else{
				msgArr.push(lang(descr));
			}
			msgArr.length && (msg += '<br>');
			msg += msgArr.join('<br>');
		}

		showNotify(msg, 'e', 3);
		if(err.status === 401){
			return Auth.logout();
		}
	};


	function checkErrors(resp, show, isRaw){
		(typeof show === 'undefined') && (show = true);
		if(__.getObjVal(resp, 'status') === 'error'){
			var errors = [lang(resp.message)];
			var msgArr = ['<div class="h4 m0">' + lang(resp.message) + '</div>'];
			if(resp.data){
				_.forEach(resp.data, function(err){
					msgArr.push('<div>' + lang(err) + '</div>');
					errors.push(lang(err));
				});
			}

			var msg = msgArr.join('');
			show && showNotify(msg, 'e', 3);
			return isRaw ? errors : msg;
		}
		return false;
	};


	function getCollapsers(module, defaults){
		var collapsers = Storage.get('collapsers', {}, true)[module] || defaults;
		var watcher = this.$watchCollection('collapsers', function(newVal){
			saveCollapsers(module, newVal);
		});
		this.$on('$destroy', watcher);
		return collapsers;
	};


	function saveCollapsers(module, collapsers){
		var allCollapsers = Storage.get('collapsers', {}, true);
		allCollapsers[module] = collapsers;
		Storage.set('collapsers', allCollapsers, false, true);
	};


	function openLink(link){
		window.open(link, '_blank');
	};


	function setInputWatcher(isPopup){
		var showFieldName = isPopup ? 'showPopupActionBtns' : 'showActionBtns';
		$scope.global[showFieldName] = false;
		!this.module && (this.module = {});
		this.module.inputWatcher && this.module.inputWatcher();
		var dateRangesFields = this.watchDateRanges || [];
		this.module.inputWatcher = this.$watch('input', function(newVal, oldVal){
			$scope.global[showFieldName] = (newVal !== oldVal);
			__.checkDatesRanges(newVal, dateRangesFields, oldVal);
		}, true);
	};


	function deleteItem(item, apiMethod, controllerType, redirectCb, successMsg){
		item = item || {};
		if(!item.id) return false;

		Api[apiMethod](item.id).then(function(resp){
			showNotify(successMsg, 's', 3);
			if(LeftList.type === controllerType && LeftList.removeItemById(item.id)){
				var newId = __.getObjVal(LeftList, ['items', 0, 'id'], '');
				redirectCb(newId);
			}
		});
	};
});
