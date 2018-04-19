/**
 * Created by david on 5/11/16.
 */
'use strict';

App.controller('LinksBuilderCtrl', function($scope, Api, localStorageService, $timeout){
	$scope.selected_link = {
		link_type: 'simple_link',
		link: '',
		pageslink: '',
		newslink: 0
	};
	$scope.pages = {};
	$scope.news = {};

	$scope.get = function() {
		$scope.pages = localStorageService.get('pages');
		if (!_.isArray($scope.pages)) {
			Api.contents('static_page','list').then(function(response){
				$scope.pages = _.map(response.data, function(o) { return {slug: o.slug, title: o.title}; });
				localStorageService.set('pages', $scope.pages);
			}, function(error){});
		}

		$scope.news = localStorageService.get('news');
		if (!_.isArray($scope.news)) {
			Api.contents('news','list').then(function(response){
				$scope.news = _.map(response.data, function(o) { return {id: o.id, title: o.title}; });
				localStorageService.set('news', $scope.news);
			}, function(error){});
		}
	}

	$scope.get();

});
