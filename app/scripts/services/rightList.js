'use strict';

App.service('RightList', function($rootScope, SideList){
	SideList.call(this);
	var self = this;

	var defaults = {
		select: select,
		multiselect: false,
		editable: false,
		selectable: true,
		changeable: true,
		edit: edit,
		onEdit: _.noop
	};


	this.setDefaults = function(opts){
		opts = opts || {};
		var baseDefaults = _.assign(self.getDefaults(), defaults);
		if(opts.filters){
			opts.filters = _.assign(baseDefaults.filters, opts.filters);
		}
		_.assign(self, baseDefaults, opts);
		return self.setUniqueId();
	};


	function select(item, index){
		if(!self.changeable) return false;
		if(self.multiselect){
			item._selected = !item._selected;
		}else{
			for(var i = 0, l = self.items.length; i < l; i++) {
				if(self.items[i]._selected){
					self.items[i]._selected = false;
					break;
				}
			}
			item._selected = true;
		}
		self.onSelect && self.onSelect(item, index);
		$rootScope.$broadcast('rightlist:select', item, index);
	};


	function edit(item, index, event){
		event.preventDefault();
		event.stopPropagation();
		self.onEdit && self.onEdit(item, index);
	};
});