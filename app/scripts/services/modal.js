'use strict';

App.service('Modal', function($modal, $rootScope, $q, $timeout){
	var self = this,
	    viewportMeta = document.querySelector('meta[name="viewport"]'),
		initedViewportContent = viewportMeta.content,
	    openedModalsCount = 0;

	var publicVars = {
		modal: {hideCloseBtn: false}
	};
	var publicFunctions = {
		showAlert: showAlert,
		confirmLeave: confirmLeave,
		confirmDelete: confirmDelete,
		imageModal: imageModal,
		pageModal: pageModal,
		confirmLeaveModal: confirmLeaveModal
	};
	_.assign(self, publicVars, publicFunctions);

	var m = self.modal;


	init();


	function init(){
		$rootScope.global = $rootScope.global || {};
		var glob = $rootScope.global;
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			openedModalsCount = 0;
			m.$modal && m.$modal.hide();
			m.$pageModal && m.$pageModal.hide();
			glob.showPopupActionBtns = false;
			self.modal = {hideCloseBtn: false};
			m = self.modal;
		});
	};


	function showAlert(msg, title){
		title = title || lang('Alert');
		m.$modal = $modal({
			title: title,
			content: '<div class="text-center">' + lang(msg) + '</div>',
			show: true,
			html: true
		});
	};


	function confirmLeave(scope, onOk){
		m.hideCloseBtn = false;
		m.buttons = [
			{content: lang('Ok'), class: 'btn-default', click: onOk}
		];

		m.$modal = $modal({
			title: lang('Confirm leaving the page'),
			content: lang('All changes will be lost'),
			closeBtnTitle: 'Cancel',
			show: true,
			html: false,
			templateUrl: 'views/components/modal.html',
			scope: scope
		});
	};


	function confirmDelete(scope, subject, onOk, arg, modalOptions){
		modalOptions = modalOptions || {};
		m.hideCloseBtn = false;
		m.buttons = [
			{content: lang('Delete'), class: 'btn-default', click: onOk, arg: arg, closeOnClick: true}
		];
		modalOptions = _.assign({
			title: lang('Confirm delete the ' + subject),
			content: lang('Are you sure you want to delete this ' + subject + '?'),
			show: true,
			html: false,
			templateUrl: 'views/components/modal.html',
			scope: scope
		}, modalOptions);
		m.$modal = $modal(modalOptions);
	};


	function imageModal(scope, image, originalImage){
		var scaledImage;
		if(image instanceof Object){
			originalImage = originalImage || image.original;
			scaledImage = image.scaled;
		}else{
			scaledImage = image;
		}
		!scaledImage && (scaledImage = originalImage);
		!originalImage && (originalImage = scaledImage);

		if(!scaledImage) return false;


		m.$modal = $modal({
			show: true,
			html: false,
			templateUrl: 'views/components/imageModal.html',
			scope: scope
		});

		m.image = scaledImage;
		m.originalImage = originalImage;

		bindModal(m.$modal, {allowZoom: true});

		return m.$modal;
	};


	function pageModal(scope, tpl, scopeData, modalClass){
		$rootScope.global.showPopupActionBtns = false;
		var modalScope = scope.$parent ? scope.$parent.$new() : scope.$new();
		_.assign(modalScope, scopeData || {});

		m.$pageModal = $modal({
			show: true,
			html: true,
			templateUrl: 'views/components/pageModal.html',
			keyboard: false,
			contentTemplate: tpl,
			backdrop: 'static',
			scope: modalScope
		});
		modalClass && (m.$pageModal.$options.animation += ' ' + modalClass);

		bindModal(m.$pageModal, {scope: modalScope, destroyOnHide: true});

		return m.$pageModal;
	};


	function confirmLeaveModal(scope, onOk){
		m.hideCloseBtn = false;
		m.buttons = [
			{content: lang('Ok'), class: 'btn-default', click: onOk}
		];

		m.$modal = $modal({
			title: lang('Confirm leaving the page'),
			content: lang('All changes will be lost'),
			closeBtnTitle: 'Cancel',
			show: true,
			html: false,
			template: 'views/components/modal.html',
			scope: scope
		});
	};


	function bindModal(modal, options){
		options = options || {};
		options.scope = options.scope || {};

		var originalModalShowFn = modal.show,
		    originalModalHideFn = modal.hide,
		    htmlEl = angular.element(document.querySelector('html'));

		modal.show = options.scope.show = function(){
			originalModalShowFn.apply(originalModalShowFn, arguments);
			openedModalsCount++;
			htmlEl.addClass('modal-open');
			if(options.allowZoom && viewportMeta){
				viewportMeta.content = 'width=device-width, minimum-scale=1, maximum-scale=5, initial-scale=1, user-scalable=yes';
			}
		};

		modal.hide = options.scope.hide = function(result){
			originalModalHideFn.apply(originalModalHideFn, arguments);
			openedModalsCount--;
			if(options.allowZoom && viewportMeta){
				viewportMeta.content = initedViewportContent;
			}
			if(options.destroyOnHide && options.scope){
				$timeout(function(){
					modal.$element.addClass('ng-hide');
					!openedModalsCount && htmlEl.removeClass('modal-open');
					options.scope.$destroy();
				}, 300);
			}else{
				!openedModalsCount && htmlEl.removeClass('modal-open');
			}
			modal.onResult && modal.onResult(result);
		};
	};
});
