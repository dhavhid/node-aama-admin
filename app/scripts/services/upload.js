'use strict';

App.service('Upload', function(FileUploader, Api, __, $rootScope, Modal, $http, $q){
	var self = this,
	    getVideoServiceEmbedCode = new GetVideoServiceEmbedCode(),
	    defaultEmbedWidth = 420,
	    defaultEmbedHeight = 345;

	isEmptyAfterSelection(true);

	var publicVars = {

	};
	var publicFunctions = {
		getUploader: getUploader,
		setFilter: setFilter,
		setFilterByName: setFilterByName,
		getUploadedObj: getUploadedObj,
		getTypeByExt: getTypeByExt,
		resetFileInput: resetFileInput,
		isEmptyAfterSelection: isEmptyAfterSelection,
		bindUploader: bindUploader,
		getFileNameInfoFromUrl: getFileNameInfoFromUrl,
		getFileNameFromUrl: getFileNameFromUrl,
		getFileExtFromUrl: getFileExtFromUrl,
		addFileFromInput: addFileFromInput,
		showFilesGallery: showFilesGallery,
		removeFilter: removeFilter,
		getWysiwygEmbedFromSrc: getWysiwygEmbedFromSrc
	};
	_.assign(self, publicVars, publicFunctions);


	function getUploader(params, filter, showFilterErrors){
		var scope = this;
		(typeof params !== 'object') && (params = {});
		params = _.assign({
			scope: scope,
			url: filter === 'i' ? Api.imagesUploadUrl : Api.fileUploadUrl,
			alias: 'data',
			withCredentials: true,
			removeAfterUpload: true,
			multiple: false
		}, params);

		var uploader = new FileUploader(params);

		setFilter(uploader, filter, 'default', showFilterErrors);

		if(!params.multiple){
			uploader.onAfterAddingFile = function(item){
				var l = uploader.queue.length;
				(l > 1) && (uploader.queue.splice(uploader.queue[l-1], 1));
			};
		}

		uploader.onErrorItem = function(item, resp, status, headers){
			scope.showReqError(headers);
		};

		return uploader;
	};


	function setFilter(uploader, filter, filterName, showFilterErrors){
		(typeof filterName === 'undefined') && (filterName = 'default');
		(typeof showFilterErrors === 'undefined') && (showFilterErrors = true);
		var filters = {
				i: {
					ext: ['jpg','png','jpeg','gif'],
					mime: ['image/jpeg','image/pjpeg','image/png','image/x-png','image/gif']
				},
				v: {
					ext: ['mp4','flv'],
					mime: ['video/mpeg','video/mpg','video/mp4']
				},
				a: {
					ext: ['mp3'],
					mime: ['audio/mpeg','audio/mpg','audio/mp3']
				}
			},
			filterExt = [],
			filterMime = [];

		(typeof filter === 'string') && (filter = filter.split(''));

		if(typeof filter === 'object' && !(filter instanceof Array)){
			filterExt = filter.ext;
			filterMime = filter.mime;
		}else{
			_.forEach(filter, function(flt){
				if(filters[flt]){
					filterExt = _.union(filterExt, filters[flt].ext);
					filterMime = _.union(filterMime, filters[flt].mime);
				}
			});
		}

		if(filterExt.length || filterMime.length){
			var filter = {
				name: filterName,
				fn:	function(item, options){
					var result = true,
						mime = uploader.isHTML5 ? item.type : '',
						ext = item.name.slice(item.name.lastIndexOf('.') + 1).toLowerCase();

					filterExt.length && (result = _.contains(filterExt, ext));
					(filterMime.length && mime && result) && (result = _.contains(filterMime, mime));

					item.filterExt = filterExt;
					item.filterMime = filterMime;
					item.mime = mime;
					if(!result && showFilterErrors){
						uploader.scope.showNotify(lang('File type must be one of') + ': ' + filterExt.join(', '), 'e', 5);
					}

					return result;
				}
			};

			var existsFilterIndex = _.findIndex(uploader.filters, {name: filterName});
			existsFilterIndex > -1 ? uploader.filters[existsFilterIndex] = filter : uploader.filters.push(filter);
		}
	};


	function setFilterByName(uploader, filterName, showFilterErrors){
		var filter = '';
		switch(filterName){
			case 'audio': filter = 'a'; break;
			case 'video': filter = 'v'; break;
			case 'image': filter = 'i'; break;
		}

		return filter ? setFilter(uploader, filter, filterName, showFilterErrors) : false;
	};


	function removeFilter(uploader, filterName){
		_.remove(uploader.filters, {name: 'folder'});
		return self;
	};


	function getUploadedObj(item, resp){
		var mime = item.file.type,
			type = mime;
		(type.indexOf('/') > -1) && (type = type.substr(0, type.indexOf('/')));

		var fileNameParts = item.file.name.match(/(.*)\.(.*)$/) || [];
		!type && (type = getTypeByExt(fileNameParts[2]));
		var originalFileInfo = {
			fullName: item.file.name,
			name: fileNameParts[1] || '',
			ext: fileNameParts[2] || '',
			type: ''
		};

		var res = _.assign({
			mime: mime,
			type: type,
			bucket: resp.bucket,
			path: resp.path
		}, resp);

		!res.data && (res.data = {});
		res.data.originalFileInfo = originalFileInfo;

		return res;
	};


	function getTypeByExt(ext){
		var types = {
			flv: 'video',
			mp4: 'video',
			mp3: 'audio',
			jpg: 'image',
			jpeg: 'image',
			png: 'image',
			gif: 'image'
		};

		return types[ext] || '';
	};


	function resetFileInput(uploader){
		var fileInput = __.getObjVal(uploader, ['_directives', 'select', 0, 'element']);
		fileInput && fileInput.val('');
		return !!fileInput;
	};


	function isEmptyAfterSelection(val){
		FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
			return val;
		};
		FileUploader.FileSelect.prototype.onChange = function() {
			var files = this.uploader.isHTML5 ? this.element[0].files : this.element[0];
			var options = this.getOptions();
			var filters = this.getFilters();

			if(!this.uploader.isHTML5) this.destroy();
			this.uploader.addToQueue(files, options, filters);
			if(this.isEmptyAfterSelection()) {
				this.element.prop('value', null);
				//this.element.replaceWith(this.element = this.element.clone(true)); // IE fix
			}
		};
	};


	function bindUploader(scope, uploader, field, inputField, arrayResult){
		inputField = inputField || 'images';

		uploader.onAfterAddingFile = function(item){
			uploader.targetItem = scope.input || {};
		};

		uploader.onSuccessItem = function(item, resp, status, headers){
			if($rootScope.checkErrors(resp)) return false;
			resetFileInput(uploader);

			var file = getUploadedObj(item, resp),
				targetItemId = __.getObjVal(uploader, 'targetItem.id');
			!scope.input[inputField] && (scope.input[inputField] = {});

			if(targetItemId === scope.input.id){
				if(arrayResult){
					__.defineObj(scope.input, [inputField, field], []);
					var res = field ? scope.input[inputField][field] : scope.input[inputField];
					res.push(file);
				}else{
					__.defineObj(scope.input, [inputField, field]);
					if(field){
						scope.input[inputField][field] = file;
					}else{
						scope.input[inputField] = file;
					}
				}
			}
		};

		uploader.onCompleteAll = function(item, resp, status, headers){
			uploader.removeAfterUpload && uploader.clearQueue();
			resetFileInput(uploader);
		};
	};


	function getFileNameInfoFromUrl(url){
		url = url || '';
		var fileNameMatches = url.match(/[^\/?#]+(?=$|[?#])/) || [],
		    fileFullName = fileNameMatches[0] || '',
		    dotPos = fileFullName.lastIndexOf('.'),
		    result = {};
		result.name = dotPos > 0 ? fileFullName.substring(0, dotPos) : fileFullName;
		result.fullName = fileFullName;
		result.ext = dotPos > 0 ? fileFullName.substring(dotPos+1) : '';
		result.type = getTypeByExt(result.ext);

		return result;
	};


	function getFileNameFromUrl(url){
		return getFileNameInfoFromUrl(url).name;
	};


	function getFileExtFromUrl(url){
		return getFileNameInfoFromUrl(url).ext;
	};


	/**
	 *
	 * @param {scope} scope
	 * @param {string} filter can be 'i', 'v' or combination of this letters
	 * @param {event} e event
	 */
	function addFileFromInput(scope, filter, e){
		if(e){
			if(e.which !== 13) return false;
			e.preventDefault();
			e.stopPropagation();
		}
		var inputVal = scope.module.fileUrl;
		if(!inputVal) return false;

		(filter && typeof filter === 'string') && (filter = filter.split(''));

		var fileEntry;
		if(__.isUrl(inputVal)){
			fileEntry = getFileFromUrl(inputVal);
		}else if(__.isEmbed(inputVal)){
			fileEntry = getFileFromEmbed(inputVal);
		}

		if(fileEntry){
			var filterError = false;
			if(filter){
				var fileType = __.getObjVal(fileEntry, 'data.originalFileInfo.type');
				filterError = (fileType === 'image' && !_.contains(filter, 'i')) || (fileType === 'video' && !_.contains(filter, 'v'));
			}
			if(filterError){
				scope.showNotify('Invalid file type', 'e', 3);
			}else{
				!scope.input.files && (scope.input.files = []);
				scope.input.files.push(fileEntry);
			}
		}else{
			scope.showNotify('Invalid value', 'e', 2);
		}
		scope.module.fileUrl = '';
	};


	function getFileFromUrl(url){
		url = url || '';
		var result,
		    fileInfo = getFileNameInfoFromUrl(url),
			fileEntry = {
				data: {originalFileInfo: fileInfo},
				source: url,
				documentType: fileInfo.ext,
				title: fileInfo.name
			};

		if(fileInfo.type !== 'image'){
			var embedCode = getEmbedFromSrc(url);
			if(embedCode){
				result = fileEntry;
				result.data.embedCode = embedCode;
				result.data.originalFileInfo.type = 'video';
			}
		}else{
			result = fileEntry;
		}

		return result;
	};


	function getFileFromEmbed(embed){
		var src = __.getEmbedSrc(embed),
		    fileInfo = getFileNameInfoFromUrl(src),
			result = {
				data: {originalFileInfo: fileInfo},
				source: src,
				documentType: 'video',
				title: fileInfo.name
			};

		result.data.embedCode = embed;
		result.data.originalFileInfo.type = result.documentType = 'video';

		return result;
	};


	function GetVideoServiceEmbedCode(){};

	GetVideoServiceEmbedCode.prototype.youtube = function(src, asImage){
		var pattern = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?(.+)/g;
		if(asImage){
			var replacement = '<img class="ta-insert-video" src="https://img.youtube.com/vi/$1/hqdefault.jpg" ta-insert-video="http://www.youtube.com/embed/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen contenteditable="false" />';
		}else{
			replacement = '<iframe width="' + defaultEmbedWidth + '" height="' + defaultEmbedHeight + '" src="http://www.youtube.com/embed/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
		}
		return src.replace(pattern, replacement);
	};


	GetVideoServiceEmbedCode.prototype.vimeo = function(src, asImage){
		var pattern = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/ig;
		if(asImage){
			var dfd = $q.defer();
			$http.jsonp('http://vimeo.com/api/v2/video/143161118.json?callback=JSON_CALLBACK').success(function(resp){
				var thumbSrc = __.getObjVal(resp, [0, 'thumbnail_large']);
				if(!thumbSrc){
					dfd.reject();
				}else{
					var	replacement = '<img class="ta-insert-video" ta-insert-video="//player.vimeo.com/video/$1" src="' + thumbSrc + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen contenteditable="false" />';
					dfd.resolve(src.replace(pattern, replacement));
				}
			}).error(dfd.reject);
			return dfd.promise;
		}else{
			var replacement = '<iframe width="' + defaultEmbedWidth + '" height="' + defaultEmbedHeight + '" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
			return src.replace(pattern, replacement);
		}
	};


	function getEmbedFromSrc(src){
		var videoService = getVideoServiceByUrl(src);
		return getVideoServiceEmbedCode[videoService] ? getVideoServiceEmbedCode[videoService](src) : null;
	};


	function getWysiwygEmbedFromSrc(src){
		var videoService = getVideoServiceByUrl(src);
		return getVideoServiceEmbedCode[videoService] ? getVideoServiceEmbedCode[videoService](src, true) : null;
	};


	function getVideoServiceByUrl(src){
		var services = {
			youtube: ['youtube.com', 'youtu.be'],
			vimeo: ['vimeo.com']
		};
		var result;

		_.forEach(services, function(urls, service){
			_.forEach(urls, function(url){
				if(src.indexOf(url) !== -1){
					result = service;
					return false;
				}
			});
		});

		return result;
	};


	function showFilesGallery(scope){
		var modal = Modal.pageModal(scope, 'views/components/filesGalleryModal.html');

		modal.onResult = function(res){
			__.defineObj(scope, 'input.files', []);
			_.forEach(res, function(fileEntry){
				scope.input.files.push(fileEntry);
			});
		};
	};
});
