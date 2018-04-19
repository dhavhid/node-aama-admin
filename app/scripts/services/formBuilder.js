'use strict';

App.service('FormBuilder', function(__, Modal){
	var self = this;

	var defaults = {
		formItems: []
	};

	var publicVars = {
		module: {},
		elements: [
			{type: 'group', isVisible: true, formItems: []},
			{type: 'text', isVisible: true, data: {inputType: 'text'}},
			{type: 'textarea', isVisible: true},
			{type: 'checkbox', isVisible: true},
			{type: 'radio', isVisible: true},
			{type: 'select', isVisible: true, data: {options: []}},
			{type: 'date', isVisible: true},
			{type: 'info', isVisible: true}
		],
		properties: {
			text: {icon: 'icon-input', title: 'Input'},
			textarea: {icon: 'icon-textarea', title: 'Textarea'},
			group: {icon: 'icon-group', title: 'Group'},
			checkbox: {icon: 'icon-check-box', title: 'Checkbox'},
			radio: {icon: 'icon-radio-button-on', title: 'Radio'},
			select: {icon: 'icon-format-list-bulleted', title: 'Select'},
			date: {icon: 'icon-format-list-bulleted', title: 'Date'},
			info: {icon: 'icon-text', title: 'Text'}
		},
		inputTypes: [
			{name: 'Text', val: 'text'},
			{name: 'Email', val: 'email'},
			{name: 'Phone', val: 'tel'},
			{name: 'Number', val: 'number'},
			{name: 'Password', val: 'password'}
		],
		sourceTreeOptions: {},
		targetTreeOptions: {
			accept: targetTreeAccept
		},
		selectTreeOptions: {
			accept: selectTreeAccept
		}
	};
	var publicFunctions = {
		deleteNodeConfirm: deleteNodeConfirm,
		linkItems: linkItems,
		addSelectOption: addSelectOption
	};
	_.assign(self, defaults, publicVars, publicFunctions);


	init();


	function init(){

	};


	function deleteNodeConfirm(scope){
		return scope.Modal.confirmDelete(scope, 'element', scope.remove);
	};


	function linkItems(formItems){
		self.formItems = null;
		self.formItems = formItems;
	};


	function addSelectOption(node, scope){
		var selectOption = __.getObjVal(node, 'data.selectOption');
		if(!__.getObjVal(node, 'data.selectOption')) return false;
		__.defineObj(node, 'data.options', []);
		if(_.find(node.data.options, {label: selectOption})) return Modal.showAlert('This option already exists!');

		node.data.options.push({id: __.now(), label: selectOption});
		node.data.selectOption = '';
		return node.data.options;
	};


	function targetTreeAccept(sourceNodeScope, destNodesScope, destIndex){
		var sourceNodeType = sourceNodeScope.$element.attr('data-node-type'),
		    destNodeType = destNodesScope.$element.attr('data-nodes-type');
		if(sourceNodeType === destNodeType) return true;
		return false;
	};


	function selectTreeAccept(sourceNodeScope, destNodesScope, destIndex){
		return sourceNodeScope.$element.attr('data-node-type') === 'selectOption';
	};
});
