'use strict';

App.service('DevData', function($q, $timeout) {
	var now = (new Date()).getTime(),
		dayMSeconds = 3600 * 24 * 1000;

	var setDfd = function(data, delay){
		(typeof delay === 'undefined') && (delay = 1000);
		var dfd = $q.defer();
		$timeout(dfd.resolve.bind(this, data), delay);
		return dfd.promise;
	};

	var setRejectDfd = function(reason, delay){
		(typeof delay === 'undefined') && (delay = 1000);
		var dfd = $q.defer();
		$timeout(dfd.reject.bind(this, reason), delay);
		return dfd.promise;
	};

	this.data = function(){
		var res = [{

		},{

		}];
		return setDfd(res);
	};


	this.noop = function(){
		return setDfd({});
	};

	this.login = this.noop;


	this.subjectMatters = function(dataOnly){
		var data = [
			{id: 1, name: 'Membership'},
			{id: 2, name: 'Certification'},
			{id: 3, name: 'Products'},
			{id: 4, name: 'Materials'},
			{id: 5, name: 'Education'},
			{id: 6, name: 'Standards & Ballots'},
			{id: 7, name: 'Resources'},
			{id: 8, name: 'Codes & Regulations'},
			{id: 9, name: 'Industry Organizations'},
			{id: 10, name: 'Green Building'}
		];
		var res = {data: data};

		return dataOnly ? data : setDfd(res);
	};


	this.audiences = function(dataOnly){
		var data = [
			{id: 1, name: 'Manufacturers & Members (MM)'},
			{id: 2, name: 'Architects & Professionals (AP)'},
			{id: 3, name: 'Builders & Contractors (BC)'},
			{id: 4, name: 'Homeowners (HO)'}
		];
		var res = {data: data};

		return dataOnly ? data : setDfd(res);
	};


	this.init = function(){
		var subjectMatters = this.subjectMatters(true);
		var audiences = this.audiences(true);
		var res = {subjectMatters: subjectMatters, audiences: audiences};
		return setDfd(res);
	};
});