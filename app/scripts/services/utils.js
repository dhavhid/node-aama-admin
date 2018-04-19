'use strict';

App.service('__', function(moment, $stateParams, $state){
	var self = this;


	self.isObjDefined = function(obj, props){
		if(typeof obj === 'undefined'){
			return false;
		}
		(typeof props === 'string') && (props = props.split('.'));
		if(!props || !props.length){
			return true;
		}

		var testObj = obj;
		for(var i = 0, l = props.length; i < l; i++){
			testObj = testObj[props[i]];
			if(typeof testObj === 'undefined'){
				return false;
			}
		}
		return true;
	};


	self.defineObj = function(obj, props, val){
		(typeof obj === 'undefined') && (obj = {});
		(typeof val === 'undefined') && (val = {});
		(typeof props === 'string') && (props = props.split('.'));
		if(!props || !props.length){
			return obj;
		}

		var tmpObj = obj;
		for(var i = 0, l = props.length; i < l; i++){
			(typeof tmpObj[props[i]] === 'undefined') && (tmpObj[props[i]] = (i === l-1) ? val : {});
			tmpObj = tmpObj[props[i]];
		}

		return obj;
	};
	

	self.getObjVal = function(obj, props, defaultVal, toCase, notNull){
		(typeof obj === 'undefined' || !obj) && (obj = {});
		(typeof props === 'string') && (props = props.split('.'));
		toCase = toCase || 0; // -1 - lower, 1 - upper, 0 - as is

		if(!props || !props.length)	return defaultVal;

		var tmpObj = obj;
		for(var i = 0, l = props.length; i < l; i++){
			if(!tmpObj || typeof tmpObj !== 'object' || typeof tmpObj[props[i]] === 'undefined' || (notNull && tmpObj[props[i]] === null)) return defaultVal;
			tmpObj = tmpObj[props[i]];
		}
		if(toCase && typeof tmpObj === 'string'){
			tmpObj = toCase < 0 ? tmpObj.toLowerCase() : tmpObj.toUpperCase();
		}

		return tmpObj;
	};


	self.isObjEmpty = function(obj) {
		if(!obj || typeof obj !== 'object') return true;

		for(var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	};

	self.searchInArrayById = function(arr, id){
		for(var i = 0, l = arr.length; i < l; i++){
			var item = arr[i];
			if(id === item.id){
				return item;
				break;
			}
		}
		return undefined;
	};


	self.defaultKwFunc = function(obj, index, kw, kwSearchFields){
		var result = false;
		if(!kw) return true;

		var regexp = new RegExp(kw, 'igm'),
		    fields = [''];

		_.forEach(kwSearchFields, function(field){
			if(!field) return;
			var fieldVal = self.getObjVal(obj, field, '');
			fields.push(fieldVal);
			fields[0] += ' ' + fieldVal;
		});

		for(var i = 0, l = fields.length; i < l; i++){
			var field = fields[i];
			result = regexp.test(field);
			if(result) break;
		};

		return result;
	};


	self.toArray = function(obj){
		if(obj instanceof Array){
			return obj;
		}
		if(obj instanceof String){
			return [obj];
		}
		if(obj instanceof Object){
			var arr = [];
			for(var i in obj) if(obj.hasOwnProperty(i)){
				arr.push(obj[i]);
			}
			return arr;
		}

		return [];
	};


	self.stateParam = function(name, defaultValue, type, isTypeStrict){
		var param = $stateParams[name] ? $stateParams[name] : defaultValue;
		(typeof param === 'string' && param.charAt(0) === '/') && (param = param.substr(1));
		if(isTypeStrict || typeof param !== 'undefined'){
			switch(type){
				case 'int': param = parseInt(param); break;
				case 'float': param = parseFloat(param); break;
			}
		}
		return param;
	};


	self.stateIntParam = function(name, defaultValue, isTypeStrict){
		return self.stateParam(name, defaultValue, 'int', isTypeStrict);
	};


	self.stateFloatParam = function(name, defaultValue, isTypeStrict){
		return self.stateParam(name, defaultValue, 'float', isTypeStrict);
	};


	self.stateName = function(){
		return $state.current.name;
	};


	self.max = function(){
		return Math.max.apply(this, arguments);
	};


	self.getRnd = function(int){
		var res = Math.random();
		int && (res = (res+'').split('.')[1]);
		return res;
	};


	self.now = function(){
		return (new Date()).getTime();
	};


	self.dateToNumber = function(date){
		var mDate = moment(date);
		return +mDate.format('YYYYMMDD');
	};


	self.dateTimeToNumber = function(date){
		var mDate = moment(date);
		return self.dateToNumber(date) * 10000 + mDate.diff(mDate.startOf('day'), 'minutes');
	};


	self.dateSecToNumber = function(date){
		var mDate = moment(date);
		return self.dateToNumber(date) * 100000 + mDate.diff(mDate.startOf('day'), 'seconds');
	};


	self.checkDatesRanges = function(item, dateFields, oldItem){
		if(!item) return false;
		_.forEach(dateFields, function(dateField){
			var startDateField = dateField[0],
			    endDateField = dateField[1],
			    startDate = item[startDateField],
			    endDate = item[endDateField],
			    oldStartDate = oldItem ? oldItem[startDateField] : null;

			if(!startDate || !endDate) return true;

			var isStartDateChanged = (oldStartDate && moment(startDate).unix() !== moment(oldStartDate).unix());

			if(moment(startDate).isAfter(moment(endDate))){
				if(isStartDateChanged){
					item[endDateField] = item[startDateField];
				}else{
					item[startDateField] = item[endDateField];
				}
			}
		});
	};


	self.getLocalTz = function(){
		return moment().format('Z');
	};


	self.getLocalTzOffset = function(){
		return moment().utcOffset();
	};


	self.getOffsetFromTz = function(tz){
		return (typeof tz === 'number' && !isNaN(tz) && isFinite(tz)) ? tz : moment().utcOffset(tz).utcOffset();
	};


	self.changeTimezone = function(fromTz, toTz, dateObj, fields){
		if(!toTz) return dateObj;

		var fromOffset = self.getOffsetFromTz(fromTz),
		    toOffset = self.getOffsetFromTz(toTz),
		    offsetDiff = fromOffset - toOffset;

		function setTz(date){
			//console.log(moment(date).utc().add(offsetDiff, 'minute').format());
			date = moment(date).utc().add(offsetDiff, 'minute').format();
			return date;
		};

		if(fields){
			_.forEach(fields, function(field){
				dateObj[field] && (dateObj[field] = setTz(dateObj[field]));
			});
			return dateObj;
		}

		return setTz(dateObj);
	};


	self.changeTimezoneToLocal = function(fromTz, dateObj, fields){
		return self.changeTimezone(fromTz, self.getLocalTzOffset(), dateObj, fields);
	};


	self.changeTimezoneToRemote = function(toTz, dateObj, fields){
		return self.changeTimezone(self.getLocalTzOffset(), toTz, dateObj, fields);
	};


	self.slug = function(str){
		if(!str) return '';
		str = str.replace(/^\s+|\s+$/g, ''); // trim
		str = str.toLowerCase();

		// remove accents, swap ñ for n, etc
		var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
		var to   = "aaaaaeeeeeiiiiooooouuuunc------";
		for (var i = 0, l = from.length; i < l ; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}

		str = str.replace(/[^a-z0-9 -\.]/g, '') // remove invalid chars
			.replace(/\s+/g, '-') // collapse whitespace and replace by -
			.replace(/\.+/g, '-') // collapse dots and replace by -
			.replace(/-+/g, '-'); // collapse dashes

		return str;
	};


	self.groupRegistrationFormItems = function(formItems){
		!formItems.all && (formItems.all = []);
		formItems.root = [];
		formItems.groups = {};

		_.forEach(formItems.all, function(node){
			var item = node.registrationFormItem || node;
			(item.type === 'group') && (formItems.groups[item.id] = []);
		});
		_.forEach(formItems.all, function(node){
			var item = node.registrationFormItem || node,
			    groupId = item.groupId;
			(groupId && formItems.groups[groupId]) ? formItems.groups[groupId].push(item) : formItems.root.push(item);
		});
	};


	self.roundTo = function(val, digits){
		var power = Math.pow(10, digits);
		return Math.round(val * power) / power;
	};


	self.arrToStr = function(arr, field, delim){
		field = field || 'name';
		_.isUndefined(delim) && (delim = '<br>');
		return _.pluck(arr, field).join(delim);
	};


	self.isUrl = function(str){
		str = str || '';
		return !!str.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
	};


	self.isEmbed = function(str){
		str = str || '';
		return !!str.match(/(<iframe.+?<\/iframe>)/g);
	};


	self.getEmbedSrc = function(str){
		str = str || '';
		var src;
		str.replace(/(src)=["']([^"']*)["']/gi, function(all, type, val){
			src = val;
		});

		return src;
	};
});