'use strict';

App.config(function(){
	if(!window.CKEDITOR) return false;

	window.CKEDITOR.on('dialogDefinition', function(e){
		var dialog = e.data,
			IMAGE = 1,
			LINK = 2,
			PREVIEW = 4,
			CLEANUP = 8;

		if(dialog.name !== 'image') return true;
		// Get dialog definition.
		var def = e.data.definition,
			infoContents = def.getContents('info'),
			infoElements = infoContents.elements;

		var titleElement = {
			id: 'txtTitle',
			type: 'text',
			label: 'Title',
			default: '',
			onChange: function() {
				var dialog = this.getDialog();
				//Don't load before onShow.
				if(!dialog.originalElement || !dialog.preview) return 1;
				// Read attributes and update imagePreview;
				dialog.commitContent(PREVIEW, dialog.preview);
				return 0;
			},
			setup: function(type, element){
				if(type === IMAGE)
					this.setValue(element.getAttribute('title'));
			},
			commit: function(type, element){
				if(type === IMAGE) {
					if(this.getValue() || this.isChanged())
						element.setAttribute('title', this.getValue());
				} else if(type === PREVIEW)
					element.setAttribute('title', this.getValue());
				else if(type === CLEANUP){
					element.removeAttribute('title');
				}
			}
		};
		infoElements.splice(1, 0, titleElement);
	});
})


.config(function($provide){
	function bodyClickTrigger(){
		if(document.dispatchEvent && document.createEvent){
			var clickEvt = document.createEvent('MouseEvents');
			clickEvt.initEvent('click', true, true);
			document.dispatchEvent(clickEvt, true);
		}
	};


	function stopEvent(e){
		e.stopPropagation();
		e.preventDefault();
		return false;
	};


	$provide.decorator('taOptions', function($delegate, taRegisterTool, Modal, __, taToolFunctions, $timeout, Upload){
		var taOptions = $delegate;

		function insertVideoByUrl(editor, url){
			var embed = Upload.getWysiwygEmbedFromSrc(url);
			if(embed){
				if(typeof embed === 'object' && embed.then){
					embed.then(function(code){
						return editor.wrapSelection('insertHTML', '<p>' + code + '</p>', true);
					});
				}else{
					return editor.wrapSelection('insertHTML', '<p>' + embed + '</p>', true);
				}
			}
		};


		function insertImage(editor, src, title, alt){
			title = title || '';
			alt = alt || '';
			var el = '<p><img src="' + src + '" alt="' + alt + '" title="' + title + '"></p>';
			editor.wrapSelection('insertHTML', el, true);
		};


		taOptions.toolbar = [
			['redo', 'undo'],
			['fontName', 'fontSize', 'fontColor', 'backgroundColor'],
			['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
			['p', 'pre', 'quote'],
			['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol'],
			['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'],
			['html', 'uploadImage', 'addVideo', 'addFileFromGallery', /*'insertVideo',*/ /*'insertImage', 'insertLink',*/ 'test']/*,
			['wordcount', 'charcount']*/
		];
		taOptions.classes = {
			focussed: 'focussed',
			toolbar: 'btn-toolbar',
			toolbarGroup: 'btn-group',
			toolbarButton: 'btn btn-tool',
			toolbarButtonActive: 'active',
			disabled: 'disabled',
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		};

		taRegisterTool('fontName', {
			display: "<span class='bar-btn-dropdown dropdown'>" +
					"<button class='btn btn-wysiwyg dropdown-toggle' type='button' ng-disabled='showHtml()'><i class='icon-font'></i><i class='caret'></i></button>" +
					"<ul class='dropdown-menu'><li ng-repeat='o in options'><button class='btn' style='font-family: {{o.css}}; width: 100%' type='button' ng-click='action($event, o.css)' ng-class=\"{'selected': scope.selected === o.val}\"></i>{{o.name}}</button></li></ul></span>",
			action: function (event, font) {
				if (!!event.stopPropagation) {
					event.stopPropagation();
					bodyClickTrigger();
				}
				var scope = this.scope || {};
				scope.selected = font.replace(/\'/g, '');
				return this.$editor().wrapSelection('fontName', font);
			},
			activeState: function(commonElement){
				if (commonElement && commonElement.nodeName === '#document') return false;
				if (commonElement){
					var scope = this.scope || {};
					scope.selected = commonElement.attr('face') || commonElement.css('font-face');
				}
				return false;
			},
			scope: {selected: undefined},
			options: [
				{ name: 'Sans-Serif', css: 'Arial, Helvetica, sans-serif', val: 'Arial, Helvetica, sans-serif' },
				{ name: 'Serif', css: "'times new roman', serif", val: 'times new roman, serif' },
				{ name: 'Wide', css: "'arial black', sans-serif", val: 'arial black, sans-serif' },
				{ name: 'Narrow', css: "'arial narrow', sans-serif", val: 'arial narrow, sans-serif' },
				{ name: 'Comic Sans MS', css: "'comic sans ms', sans-serif", val: 'comic sans ms, sans-serif' },
				{ name: 'Courier New', css: "'courier new', monospace", val: 'courier new, monospace' },
				{ name: 'Garamond', css: 'garamond, serif', val: 'garamond, serif' },
				{ name: 'Georgia', css: 'georgia, serif', val: 'georgia, serif' },
				{ name: 'Tahoma', css: 'tahoma, sans-serif', val: 'tahoma, sans-serif' },
				{ name: 'Trebuchet MS', css: "'trebuchet ms', sans-serif", val: 'trebuchet ms, sans-serif' },
				{ name: "Helvetica", css: "'Helvetica Neue', Helvetica, Arial, sans-serif", val: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
				{ name: 'Verdana', css: 'verdana, sans-serif', val: 'verdana, sans-serif' },
				{ name: 'Proxima Nova', css: 'proxima_nova_rgregular', val: 'proxima_nova_rgregular' }
			]
		});


		taRegisterTool('fontSize', {
			display: "<span class='bar-btn-dropdown dropdown'>" +
					"<button class='btn btn-wysiwyg dropdown-toggle' type='button' ng-disabled='showHtml()'><i class='icon-format-size'></i><i class='caret'></i></button>" +
					"<ul class='dropdown-menu' style='width: 50px;'><li ng-repeat='o in options'><button class='btn' style='font-size: {{o.css}}; width: 100%' type='button' ng-click='action($event, o.value)' ng-class=\"{'selected': scope.selected == o.value}\"></i> {{o.name}}</button></li></ul>" +
					"</span>",
			action: function (event, size) {
				if (!!event.stopPropagation) {
					event.stopPropagation();
					bodyClickTrigger();
				}
				var scope = this.scope || {};
				scope.selected = size;
				return this.$editor().wrapSelection('fontSize', parseInt(size));
			},
			activeState: function(commonElement){
				if (commonElement && commonElement.nodeName === '#document') return false;
				if (commonElement){
					var scope = this.scope || {};
					scope.selected = commonElement.attr('size') || commonElement.css('font-size');
				}
				return false;
			},
			scope: {selected: undefined},
			options: [
				{ name: 1, css: '6px', value: 1 },
				{ name: 2, css: '9px', value: 2 },
				{ name: 3, css: '12px', value: 3 },
				{ name: 4, css: '14px', value: 4 },
				{ name: 5, css: '16px', value: 5 },
				{ name: 6, css: '18px', value: 6 },
				{ name: 7, css: '20px', value: 7 }
			]
		});


		taRegisterTool('backgroundColor', {
			display: '<button type="button" colorpicker="rgba" colorpicker-position="bottom" class="btn btn-wysiwyg btn-tool" ng-model="scope.color" ng-change="scope.color && action(scope.color)"><i class="icon-format-color-fill"></i><span class="color-preview" ng-style="{\'background-color\': scope.color}"></span><i class="caret"></i></button>',
			action: function (color) {
				if (this.$editor().wrapSelection) {
					return this.$editor().wrapSelection('backColor', color);
				}
			},
			scope: {color: "#fff"}
		});


		taRegisterTool('fontColor', {
			display: '<button type="button" colorpicker colorpicker-position="bottom" class="btn btn-wysiwyg btn-tool" ng-model="scope.color" ng-change="scope.color && action(scope.color)"><i class="icon-text"></i><span class="color-preview" ng-style="{\'background-color\': scope.color}"></span><i class="caret"></i></button>',
			action: function (color) {
				if (this.$editor().wrapSelection) {
					return this.$editor().wrapSelection('foreColor', color);
				}
			},
			scope: {color: "#000"}
		});


		taRegisterTool('addVideo', {
			iconclass: 'icon-youtube-play',
			tooltiptext: 'Insert video',
			action: function(){
				var urlPrompt,
				    editor = this.$editor();

				urlPrompt = window.prompt('Enter Youtube or Vimeo url', 'https://');
				if (urlPrompt && urlPrompt !== '' && urlPrompt !== 'https://') {
					insertVideoByUrl(editor, urlPrompt);
				}
				return false;
			},
			onElementSelect: {
				element: 'img',
				onlyWithAttrs: ['ta-insert-video'],
				action: taToolFunctions.imgOnSelectAction
			}
		});


		taRegisterTool('uploadImage', {
			iconclass: "icon-image",
			tooltiptext: 'Upload images',
			action: function (dfd, restoreSelection){
				var scope = __.getObjVal(this, '$parent.$parent', this),
				    editor = this.$editor(),
				    modal = Modal.pageModal(scope, 'views/components/uploadImageModal.html', {}, 'slim');

				modal.onResult = function(res){
					restoreSelection();
					if(!res) return dfd.resolve();

					$timeout(function(){
						if(res.uploaded instanceof Array){
							_.forEach(res.uploaded, function(img){
								restoreSelection();
								insertImage(editor, img.source);
							});
						}else if(res.uploaded){
							insertImage(editor, res.uploaded.source);
						}

						if(res.url){
							restoreSelection();
							insertImage(editor, res.url);
						}
						editor.wrapSelection('insertHTML', '<p><br></p>', true);
					}, 200);
					dfd.resolve();
				};

				return false;
			},
			onElementSelect: {
				element: 'img',
				action: function(event, $element, editorScope){
					taToolFunctions.imgOnSelectAction.apply(this, arguments);

					editorScope.displayElements.popover.off('mousedown');
					function restorePopoverEvents(){
						editorScope.displayElements.popover.on('mousedown', function(e, eventData){
							if(eventData) angular.extend(e, eventData);
							e.preventDefault();
							return false;
						});
					}

					function finishEdit(){
						editorScope.updateTaBindtaTextElement();
						editorScope.hidePopover();
						restorePopoverEvents();
					};

					var container = editorScope.displayElements.popoverContainer;

					var altBox = angular.element('<div class="form-group"><label>Image Alt</label><input type="text" class="form-control" tabindex="1" value="' + ($element.attr('alt') || '') + '"></div>');
					altBox.on('click keyup', stopEvent);

					var titleBox = angular.element('<div class="form-group"><label>Image Title</label><input type="text" class="form-control" tabindex="1" value="' + ($element.attr('title') || '') + '"></div>');
					titleBox.on('click keyup', stopEvent);

					var okButton = angular.element('<button type="button" class="btn btn-default pull-right" unselectable="on" tabindex="-1">Save</button>');
					okButton.on('click', function(event){
						event.preventDefault();
						$element.attr('alt', altBox.find('input').val());
						$element.attr('title', titleBox.find('input').val());
						finishEdit();
					});

					container.append(altBox).append(titleBox).append(okButton);
				}
			}
		});


		taRegisterTool('addFileFromGallery', {
			iconclass: "icon-attach-file",
			tooltiptext: 'Add file from gallery',
			action: function (dfd, restoreSelection){
				var scope = __.getObjVal(this, '$parent.$parent', this),
				    modal = Modal.pageModal(scope, 'views/components/filesGalleryModal.html', {}, 'slim'),
				    editor = this.$editor();

				modal.onResult = function(res){
					restoreSelection();
					if(!res) return dfd.resolve();

					$timeout(function(){
						if(res instanceof Object){
							_.forEach(res, function(file){
								if(file.type === 'image'){
									insertImage(editor, file.source, file.title, file.altTag)
								}else if(file.type === 'video'){
									insertVideoByUrl(editor, file.source);
								}else{
									return editor.wrapSelection('createLink', file.source, true);
								}
							});
						}

						editor.wrapSelection('insertHTML', '<p><br></p>', true);
					}, 200);
					dfd.resolve();
				};

				return false;
			}
		});

		taRegisterTool('test', {
			display: '<button type="button" class="btn btn-wysiwyg"><i class="icon-link"></i></button>',
			action: function(dfd, restoreSelection) {
				var scope = __.getObjVal(this, '$parent.$parent', this),
					modal = Modal.pageModal(scope, 'views/components/linksBuilderModal.html', {}, 'slim'),
					editor = this.$editor();

				modal.onResult = function(res) {
					restoreSelection();
					if(!res) return dfd.resolve();

					$timeout(function () {
						if (res instanceof Object) {
							var link = '';
							if (res.link_type == 'simple_link') {
								link = res.link;
							} else if (res.link_type == 'static_page') {
								link = '/pages/' + res.pageslink;
							} else {
								link = '/blog/' + res.newslink;
							}
							editor.wrapSelection('createLink', link, true);
						}
					}, 200);

					dfd.resolve();
				};

				return false;
			}
		});

		return taOptions;
	});


	$provide.decorator('taTools',function($delegate){
		var taTools = $delegate;
		taTools.bold.iconclass = 'icon-format-bold';
		taTools.italics.iconclass = 'icon-format-ital';
		taTools.underline.iconclass = 'icon-format-underline';
		taTools.strikeThrough.iconclass = 'icon-format-strikethrough';
		taTools.ul.iconclass = 'icon-format-list-bulleted';
		taTools.ol.iconclass = 'icon-format-list-numbered';
		taTools.undo.iconclass = 'icon-undo';
		taTools.redo.iconclass = 'icon-redo';
		taTools.justifyLeft.iconclass = 'icon-format-align-left';
		taTools.justifyRight.iconclass = 'icon-format-align-right';
		taTools.justifyCenter.iconclass = 'icon-format-align-center';
		taTools.justifyFull.iconclass = 'icon-format-align-justify';
		taTools.indent.iconclass = 'icon-format-indent-increase';
		taTools.outdent.iconclass = 'icon-format-indent-decrease';
		taTools.clear.iconclass = 'icon-block';
		taTools.insertLink.iconclass = 'icon-link';
		taTools.quote.iconclass = 'icon-format-quote';
		taTools.insertImage.iconclass = 'icon-image';
		taTools.insertLink.iconclass = 'icon-link';
		taTools.insertVideo.iconclass = 'icon-youtube-play';
		taTools.html.iconclass = 'icon-code';
		return taTools;
	});
})


.factory('youtubeParser', function youtubeParserFactory() {
	return function(url) {
		var match = url && url.match((/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/));
		return match && match[2].length === 11 ? match[2] : false;
	};
})
//replace youtube iframes in content for displaing in wysiwyg
.factory('taReverseCustomRenderers', function(youtubeParser){
	return function(val){
		var element = angular.element('<div></div>');
		element.html(val);

		var iframes = element.find('iframe');
		_.forEach(iframes, function(iframe){
			var embedSlug = youtubeParser(iframe.src);
			if(!embedSlug) return true;

			var embedHtml = '<img class="ta-insert-video" src="https://img.youtube.com/vi/' + embedSlug + '/hqdefault.jpg" ta-insert-video="' + iframe.src + '" contenteditable="false" allowfullscreen="true" frameborder="0"';
			if (iframe.width) {
				embedHtml += ' width="' + iframe.width + '"';
			}
			if (iframe.height) {
				embedHtml += ' height="' + iframe.height + '"';
			}
			embedHtml += ' />';
			angular.element(iframe).replaceWith(embedHtml);
		});

		return element.html();
	};
});
