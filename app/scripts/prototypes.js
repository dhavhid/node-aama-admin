'use strict';

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

Array.prototype.sortByField = function(field, desc) {
	return this.sort(function(a, b){
		(typeof field === 'string') && (field = field.split('.'));
		if(!field || !field.length){
			return 0;
		}
		var fieldA = undefined,
			fieldB = undefined;
		for(var i = 0, l = field.length; i < l; i++){
			fieldA = (typeof a[field[i]] === 'undefined') ? undefined : (a = a[field[i]]);
			fieldB = (typeof b[field[i]] === 'undefined') ? undefined : (b = b[field[i]]);
		}

		return desc ? (fieldB - fieldA) : (fieldA - fieldB);
	});
};


Array.prototype.searchByCriteria = function(criteria, strict){
	if(!criteria || typeof criteria !== 'object') return {};

	for(var i = 0, l = this.length; i < l; i++){
		var item = this[i],
			find = true;

		for(var key in criteria) if(criteria.hasOwnProperty(key)){
			if(typeof item[key] === 'undefined'){
				find = false; break;
			}
			if((strict && criteria[key] !== item[key]) || (!strict && criteria[key] != item[key])){
				find = false; break;
			}
		}

		if(find) return {item: item, index: i};
	}

	return {};
};


Array.prototype.deleteByCriteria = function(criteria, strict){
	var res = this.searchByCriteria(criteria, strict);
	if(res.item){
		this.splice(res.index, 1);
		return true;
	}
	return false;
};


String.prototype.lpad = function (padding, length) {
	var string = this;
	while (string.length < length) {
		string = padding + string;
	}
	return string;
};


Number.prototype.round = function(base) {
	if (base == null || base < 0) {
		return this;
	}

	var string = this.toString();
	var point_index = string.indexOf(".");
	if (point_index == -1) {
		return this;
	}
	var symbol_index = point_index + 1 + base;
	if (symbol_index >= string.length) {
		return this;
	}

	var integer        = parseInt(string.substring(0, point_index), 10);
	var fractional     = parseInt(string.substring(point_index + 1, point_index + 1 + base), 10) || 0;
	var max_fractional = Math.pow(10, base);
	var symbol         = parseInt(string.charAt(symbol_index), 10);
	if (symbol >= 5) {
		if (base == 0) {
			integer ++;
		} else {
			if (fractional + 1 == max_fractional) {
				integer ++;
				fractional = 0;
			} else {
				fractional ++;
			}
		}
	}

	return (new Number(parseFloat(integer + "." + (fractional.toString().lpad("0", base))))).valueOf();
};