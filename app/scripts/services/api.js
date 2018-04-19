'use strict';

App.service('Api', function($resource, Config, $q, $http, __, $rootScope){
	$http.defaults.withCredentials = true;

	var self = this,
	    showHiddenOnce = false,
	    showHidden = false,
	    showHiddenPreviuos = false,
	    isShowReqErrors = true,
	    isHideReqErrorsOnce = false,
	    isShowRespErrors = true,
	    isHideRespErrorsOnce = false,
	    requests = {};

	self.activeReqs = {};
	self.fileUploadUrl = Config[Config.config].serverUrl + 'files/upload/';
	self.imagesUploadUrl = Config[Config.config].serverUrl + 'files/upload_image/';

	self.abortAll = abortAll;
	self.restoreShowHidden = restoreShowHidden;
	self.setShowHidden = setShowHidden;
	self.showReqErrors = showReqErrors;
	self.hideReqErrorsOnce = hideReqErrorsOnce;
	self.hideReqErrors = hideReqErrors;
	self.toggleReqErrors = toggleReqErrors;
	self.showRespErrors = showRespErrors;
	self.hideRespErrorsOnce = hideRespErrorsOnce;
	self.hideRespErrors = hideRespErrors;
	self.toggleRespErrors = toggleRespErrors;


	self.r = function(){
		return $resource(Config[Config.config].serverUrl + ':action/:method/:id/:param/:subparam', {}, {
			//USERS
			login: {method: 'POST', params: {action: 'users', method: 'session'}},
			logout: {method: 'DELETE', params: {action: 'users', method: 'session'}},
			passwordRestore: {method: 'POST', params: {action: 'users', method: 'password', param: 'restore'}},
			passwordReset: {method: 'POST', params: {action: 'users', method: 'password', param: 'reset'}},
			user: {method: 'GET', params: {action: 'user'}},
			users: {method: 'GET', params: {action: 'users'}},
			userCreate: {method: 'POST', params: {action: 'users'}},
			userUpdate: {method: 'PUT', params: {action: 'users'}},
			userDelete: {method: 'DELETE', params: {action: 'users'}},
			//OPTIONS
			options: {method: 'GET', params: {action: 'options'}},
			audiences: {method: 'GET', params: {action: 'options', method: 'audience'}},
			subjectMatters: {method: 'GET', params: {action: 'options', method: 'subject_matter'}},
			tags: {method: 'GET', params: {action: 'tags'}},
			//FORMS
			forms: {method: 'GET', params: {action: 'forms'}},
			formCreate: {method: 'POST', params: {action: 'forms'}},
			formUpdate: {method: 'PUT', params: {action: 'forms'}},
			formDelete: {method: 'DELETE', params: {action: 'forms'}},
			formItems: {method: 'GET', params: {action: 'form_items'}},
			formItemCreate: {method: 'POST', params: {action: 'form_items'}},
			formItemUpdate: {method: 'PUT', params: {action: 'form_items'}},
			formItemDelete: {method: 'DELETE', params: {action: 'form_items'}},
			//CATEGORIES
			categories: {method: 'GET', params: {action: 'category'}},
			categoryCreate: {method: 'POST', params: {action: 'category'}},
			categoryUpdate: {method: 'PUT', params: {action: 'category'}},
			categoryDelete: {method: 'DELETE', params: {action: 'category'}},
			//CONTENTS
			contents: {method: 'GET', params: {action: 'contents'}},
			contentCreate: {method: 'POST', params: {action: 'contents'}},
			contentUpdate: {method: 'PUT', params: {action: 'contents'}},
			contentDelete: {method: 'DELETE', params: {action: 'contents'}},
			revisions: {method: 'GET', params: {action: 'contents', param: 'revisions'}},
			revert: {method: 'PUT', params: {action: 'contents', param: 'revisions'}},
			//FILES
			files: {method: 'GET', params: {action: 'files', method: 'list'}},
			file: {method: 'GET', params: {action: 'files'}},
			fileUpdate: {method: 'PUT', params: {action: 'files'}},
			fileDelete: {method: 'DELETE', params: {action: 'files'}}
		});
	};


	function setDfdAbort(dfd){
		dfd.abort = function(reason){
			reason = reason || 'aborted';
			this.reject(reason);
		};
	};


	function setDateFieldsToLocal(data, dateFieldsToLocal){
		if(dateFieldsToLocal){
			data.timezone && __.changeTimezoneToLocal(data.timezone, data, dateFieldsToLocal);
			if(data.data instanceof Array){
				_.forEach(data.data, function(val, key){
					val.timezone && __.changeTimezoneToLocal(val.timezone, val, dateFieldsToLocal);
				});
			}
		}
	};


	function proccessRequest(promise, method, dateFieldsToLocal){
		var dfd = $q.defer(),
		    rnd = Math.random(),
		    _isShowReqErrors = isShowReqErrors,
		    _isShowRespErrors = isShowRespErrors;

		if(isHideReqErrorsOnce){
			isHideReqErrorsOnce = false;
			isShowReqErrors = true;
		}
		if(isHideRespErrorsOnce){
			isHideRespErrorsOnce = false;
			isShowRespErrors = true;
		}

		!self.activeReqs[method] && (self.activeReqs[method] = 0);
		self.activeReqs[method]++;

		setDfdAbort(dfd);
		requests[rnd] = dfd;

		promise.then(function(resp){
			//clean resp data from resource promise object
			var data = (resp instanceof Array) ? [] : {};
			_.forEach(resp, function(val, key){
				(typeof key !== 'string' || key.charAt(0) !== '$') && (data[key] = val);
			});
			setDateFieldsToLocal(data, dateFieldsToLocal);
			data.errors = $rootScope.checkErrors(resp, _isShowRespErrors, true);
			if(data.errors){
				throw {errors: data.errors, type: 'response'};
			}
			dfd.resolve(data);
		}, null, dfd.notify).catch(function(err){
			_isShowReqErrors && __.getObjVal(err, 'type') !== 'response' && $rootScope.showReqError(err);
			dfd.reject(err);
		}).finally(function(){
			requests[rnd] = null;
			delete(requests[rnd]);
			self.activeReqs[method]--;
		});

		return dfd;
	};


	function q(method, data, queryParams, asDefer, dateFieldsToLocal){
		queryParams && showHidden && (queryParams.showHidden = showHidden);
		if(showHiddenOnce){
			showHiddenOnce = false;
			setShowHidden();
		}
		var req = proccessRequest(self.r()[method](queryParams, data).$promise, method, dateFieldsToLocal);

		return asDefer ? req : req.promise;
	};


	function abortAll(reason){
		_.forEach(requests, function(request){
			request.abort(reason);
		});
	};


	/* COMMON */
	function showReqErrors(val){
		isShowReqErrors = true;
		return self;
	};

	function hideReqErrors(){
		isShowReqErrors = false;
		return self;
	};

	function toggleReqErrors(val){
		(typeof val === 'undefined') && (val = !val);
		isShowReqErrors = !!val;
		return self;
	};

	function hideReqErrorsOnce(){
		isHideReqErrorsOnce = true;
		isShowReqErrors = false;
		return self;
	};


	function showRespErrors(val){
		isShowRespErrors = true;
		return self;
	};

	function hideRespErrors(){
		isShowRespErrors = false;
		return self;
	};

	function toggleRespErrors(val){
		(typeof val === 'undefined') && (val = !val);
		isShowRespErrors = !!val;
		return self;
	};

	function hideRespErrorsOnce(){
		isHideRespErrorsOnce = true;
		isShowRespErrors = false;
		return self;
	};


	function setDataFields(data, fields, dateFieldsToRemote){
		data = _.cloneDeep(data || {});
		_.forEach(fields, function(field){
			data[field + 'Id'] = __.getObjVal(data, [field, 'id'], data[field + 'Id']);
			delete data[field];
		});
		dateFieldsToRemote && data.timezone && __.changeTimezoneToRemote(data.timezone, data, dateFieldsToRemote);
		return data;
	};


	function restoreShowHidden(val){
		if(typeof val === 'undefined'){
			showHidden = showHiddenPreviuos ? 1 : 0;
		}else{
			showHiddenPreviuos = showHidden;
			showHidden = val ? 1 : 0;
		}
		return self;
	};

	function setShowHidden(val, once){
		if(typeof val === 'undefined'){
			showHidden = showHiddenPreviuos ? 1 : 0;
		}else{
			showHiddenPreviuos = showHidden;
			showHidden = val ? 1 : 0;
		}
		showHiddenOnce = !!once;
		return self;
	};
	/* --COMMON */


	/* USERS */
	self.login = function(email, password){
		return q('login', {email: email, password: password});
	};

	self.logout = function(){
		return q('logout');
	};

	self.passwordRestore = function(email){
		return q('passwordRestore', {email: email});
	};

	self.passwordReset = function(token, password){
		return q('passwordReset', {token: token, password: password});
	};

	self.user = function(){
		return q('user');
	};

	self.users = function(id, role){
		return q('users', {}, {id: id, role: role});
	};

	self.userCreate = function(data){
		return q('userCreate', data);
	};

	self.userUpdate = function(id, data){
		return q('userUpdate', data, {id: id});
	};

	self.userDelete = function(id){
		return q('userDelete', {}, {id: id});
	};
	/* --USERS */


	/* OPTIONS */
	self.options = function(){
		return q('options');
	};

	self.audiences = function(){
		return q('audiences');
	};

	self.subjectMatters = function(){
		return q('subjectMatters');
	};

	self.tags = function(data){
		return q('tags', {}, data);
	};
	/* --OPTIONS */


	/* MESSAGES */
	self.messages = function(id){
		return q('messages', {}, {id: id});
	};
	/* --MESSAGES */


	/* FORMS */
	self.forms = function(id){
		return q('forms', {}, {id: id});
	};

	self.formCreate = function(data){
		return q('formCreate', data);
	};

	self.formUpdate = function(id, data){
		return q('formUpdate', data, {id: id});
	};

	self.formDelete = function(id){
		return q('formDelete', {}, {id: id});
	};

	self.formItems = function(id){
		return q('formItems', {}, {id: id});
	};

	self.formItemCreate = function(data){
		return q('formItemCreate', data);
	};

	self.formItemUpdate = function(id, data){
		return q('formItemUpdate', data, {id: id});
	};

	self.formItemDelete = function(id){
		return q('formItemDelete', {}, {id: id});
	};
	/* --FORMS */


	/* CATEGORIES */
	self.categories = function(type, orderMode){
		orderMode = orderMode || 'list';
		return q('categories', {}, {method: type, param: 'list', mode: orderMode});
	};

	self.category = function(id){
		return q('categories', {}, {id: id});
	};

	self.categoryCreate = function(data, type){
		return q('categoryCreate', data, {method: type});
	};

	self.categoryUpdate = function(id, data){
		return q('categoryUpdate', data, {id: id});
	};

	self.categoryDelete = function(id){
		return q('categoryDelete', {}, {id: id});
	};
	/* --CATEGORIES */


	/* CONTENTS */
	self.contents = function(type, orderMode){
		orderMode = orderMode || 'list';
		return q('contents', {}, {method: type, param: 'list', mode: orderMode});
	};

	self.content = function(id){
		return q('contents', {}, {id: id});
	};

	self.contentCreate = function(data, type){
		return q('contentCreate', data, {method: type});
	};

	self.contentUpdate = function(id, data){
		return q('contentUpdate', data, {id: id});
	};

	self.contentDelete = function(id){
		return q('contentDelete', {}, {id: id});
	};

	self.contentOrder = function(data, type){
		return q('contentCreate', data, {method: type, param: 'order'});
	};

	self.revisions = function(id){
		return q('revisions', {}, {id: id});
	};

	self.revert = function(id, revisionNumber){
		return q('revert', {revisionNumber: revisionNumber}, {id: id});
	};
	/* CONTENTS */


	/* FILES */
	self.files = function(page, limit, kw){
		return q('files', {}, {page: page, limit: limit, kw: kw});
	};

	self.file = function(id){
		return q('file', {}, {id: id});
	};

	self.fileUpdate = function(id, data){
		return q('fileUpdate', data, {id: id});
	};

	self.fileDelete = function(id){
		return q('fileDelete', {}, {id: id});
	};
	/* FILES */
});
