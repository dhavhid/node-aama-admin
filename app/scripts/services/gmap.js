'use strict';

App.service('Gmap', function($window, $q, $rootScope, Storage, __, Config){
	var self = this,
		loadDfd = $q.defer(),
	    mnm = 'gmap',
		defaultSelectorId = 'gmap',
		defaultLat = Config.defaults.location.lat,
		defaultLng = Config.defaults.location.lng;

	var publicVars = {
		map: {},
		markers: [],
		loading: false,
		loaded: false,
		geocoder: null,
		geocoderCacheSize: 100,
		geocoderStatuses: {
			ERROR:            lang('There was a problem contacting the Google servers'),
			INVALID_REQUEST:  lang('Geocoder Request was invalid'),
			OK:               lang('The response contains a valid Geocoder Response'),
			OVER_QUERY_LIMIT: lang('The application has gone over the requests limit in too short a period of time'),
			REQUEST_DENIED:   lang('The application is not allowed to use the geocoder'),
			UNKNOWN_ERROR:    lang('A geocoding request could not be processed due to a server error. The request may succeed if you try again'),
			ZERO_RESULTS:     lang('No result was found for this Geocoder Request')
		},
		geocoderCache: {
			location: Storage.get('geocoderCacheLocation', []),
			address: Storage.get('geocoderCacheAddress', []),
			data: {}
		},
		lastCenter: [],
		lastZoom: 13
	};
	var publicFunctions = {
		mapName: mapName,
		load: load,
		getMap: getMap,
		destroyMap: destroyMap,
		destroyMaps: destroyMaps,
		getColorByName: getColorByName,
		setMapMarker: setMapMarker,
		setMapMarkers: setMapMarkers,
		setInfoWindow: setInfoWindow,
		setMapRoute: setMapRoute,
		removeMarkers: removeMarkers,
		removeRoute: removeRoute,
		setRefreshMap: setRefreshMap,
		geocode: geocode,
		showLocationOnMap: showLocationOnMap,
		geocodeAddress: geocodeAddress
	};
	_.assign(self, publicVars, publicFunctions);


	$rootScope.$on('$stateChangeSuccess', destroyMaps);


	function mapName(name){
		name && (mnm = name);
		return mnm;
	};


	function load(){
		$window.initGmap = function(){
			self.loaded = true;
			loadDfd.resolve();
		};

		if(!self.loading && !self.loaded){
			self.loading = true;
			var s = document.createElement('script'); // use global document since Angular's $document is weak
			s.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initGmap';
			document.body.appendChild(s);
			s.onload = s.onreadystatechange = function(){
				self.loading = false;
				s.onload = s.onreadystatechange = null;
			};
		}

		return loadDfd.promise;
	};


	function getMap(selectorId, center, mapOptions, callbacks){
		callbacks = callbacks || {};
		selectorId = selectorId || defaultSelectorId;
		center = center || self.lastCenter;
		!center[0] && (center[0] = defaultLat);
		!center[1] && (center[1] = defaultLng);
		var dfd = $q.defer();

		load().then(function(){
			if($window.google && $window.google.maps){
				createMap(selectorId, center, mapOptions, callbacks) ? dfd.resolve(self.map[mnm]) : dfd.reject('google map creating error');
			}else{
				dfd.reject(lang('google map not loaded'));
			}
		}, function(){
			dfd.reject(lang('google map not loaded, promise rejected'));
		});

		return dfd.promise;
	};


	function destroyMap(){
		if(!self.map[mnm]) return false;
		var div = self.map[mnm].getDiv();
		self.infoWindow.close();
		removeMarkers();
		self.map[mnm] = null;
		delete(self.map[mnm]);
		google.maps.event.clearInstanceListeners(window);
		google.maps.event.clearInstanceListeners(document);
		google.maps.event.clearInstanceListeners(div);
		try {div.parentNode.removeChild(div);} catch(err){};
	};


	function destroyMaps(){
		var currentMapName = mapName();
		for(var i in self.map){
			mapName(i);
			destroyMap();
		}
		mapName(currentMapName);
	};


	function createMap(selectorId, center, mapOptions, callbacks){
		mapOptions = mapOptions || {};
		var mapEl = document.getElementById(selectorId);
		if(!($window.google && $window.google.maps && mapEl)){
			return false;
		}
		if(self.map[mnm]){
			//return self.map[mapName];
		}

		mapOptions = _.assign({
			center: new google.maps.LatLng(center[0], center[1]),
			zoom: self.lastZoom,
			maxZoom: 18,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: false,
			draggable: true,
			zoomControl: true
		}, mapOptions);

		self.map[mnm] = new google.maps.Map(mapEl, mapOptions);
		self.markers = [];
		self.infoWindow = new google.maps.InfoWindow({maxWidth: 240});
		self.map[mnm].route = null;

		google.maps.event.addListener(self.map[mnm], 'idle', function(){
			google.maps.event.trigger(self.map[mnm], 'resize');
		});
		google.maps.event.addListener(self.map[mnm], 'tilesloaded', function(){
			google.maps.event.trigger(self.map[mnm], 'resize');
		});
		google.maps.event.addListener(self.map[mnm], 'center_changed', function(){
			var center = self.map[mnm].getCenter();
			self.lastCenter[0] = center.lat();
			self.lastCenter[1] = center.lng();
		});
		google.maps.event.addListener(self.map[mnm], 'zoom_changed', function(){
			self.lastZoom = self.map[mnm].getZoom();
		});

		for(var e in callbacks){
			(function(cb, map){
				google.maps.event.addListener(map, e, function(event){
					cb(event, map);
				});
			})(callbacks[e], self.map[mnm]);
		}

		return self.map[mnm];
	};


	function getColorByName(colorName, hex){
		colorName = colorName || 'blue';
		var color;
		switch(colorName){
			case 'red': color = hex ? '0xff0000ff' : '#ff0000'; break;
			case 'grey': color = hex ? '0x888888ff' : '#888888'; break;
			case 'orange': color = hex ? '0xff7200ff' : '#ff7200'; break;
			case 'purple': color = hex ? '0x510476ff' : '#510476'; break;
			case 'blue':
			default:	color = hex ? '0x43a7e2ff' : '#43a7e2'; break;
		}
		return color;
	};


	function setMapMarker(lat, lng, icon, size, props, callbacks){
		size = size || 40;
		props = props || {};
		callbacks = callbacks || {};

		var markerOptions = props.options || {},
		    userData = props.userData || {};

		var marker = new google.maps.Marker(_.assign({
			position: new google.maps.LatLng(lat, lng),
			map: self.map[mnm],
			icon: icon ? {url: icon, scaledSize: new google.maps.Size(size,size), anchor: new google.maps.Point(size/2, size/2)} : undefined
		}, markerOptions));
		marker.userData = userData;

		for(var e in callbacks){
			(function(cb, marker){
				google.maps.event.addListener(marker, e, function(event){
					cb(event, marker);
				});
			})(callbacks[e], marker);
		}

		self.markers.push(marker);

		return marker;
	};


	function setMapMarkers(props, colorName, markerName, callbacks){
		var markersBounds = null;

		for(var i = 0, l = props.length; i < l; i++){
			var markerProps = props[i],
				markerIcon = colorName && markerName ? 'images/' + markerName + '-' + colorName + '.png' : null;

			var marker = setMapMarker(markerProps.lat, markerProps.lng, markerIcon, null, markerProps, callbacks);

			if(!markersBounds){
				markersBounds = new google.maps.LatLngBounds(marker.position, marker.position);
			}else{
				markersBounds.extend(marker.position);
			}
		}
		google.maps.event.trigger(self.map[mnm], 'resize');
		markersBounds && self.map[mnm].fitBounds(markersBounds);
		setTimeout(function(){
			(self.map[mnm].getZoom() > 16) && (self.map[mnm].setZoom(16));
		}, 300);
		self.map[mnm].markersBounds = markersBounds;
	};


	function setInfoWindow(target, text){
		load().then(function(){
			self.infoWindow.close();
			self.infoWindow.setContent('<div class="google-info-window"><div class="wrapper">' + text + '</div></div>');
			self.infoWindow.open(self.map[mnm], target);
		});
	};


	function setMapRoute(markersData, colorName, markerName, props, markersCallbacks){
		props = props || {};
		var markersBounds = null,
			latLngCoords = [],
			markersCount = markersData.length,
			lastMarker = markersData[markersCount - 1],
			color = getColorByName(colorName);

		for(var i = 0, l = markersCount; i < l; i++){
			markersData[i].props = markersData[i].props || {};
			var latLng = new google.maps.LatLng(markersData[i].lat, markersData[i].lng);
			latLngCoords.push(latLng);
			if(!markersBounds){
				markersBounds = new google.maps.LatLngBounds(latLng, latLng);
			}else{
				markersBounds.extend(latLng);
			}
			if(i === markersCount - 1){
				markersData[i].props.zIndex = 10000;
				setMapMarker(lastMarker.lat, lastMarker.lng, 'images/' + markerName + '-' + colorName + '.png', null, markersData[i].props, markersCallbacks);
			}else{
				setMapMarker(markersData[i].lat, markersData[i].lng, 'images/dot-' + colorName + '.png', 10, markersData[i].props, markersCallbacks);
			}
		}

		self.map[mnm].route = new google.maps.Polyline(_.assign({
			path: latLngCoords,
			map: self.map[mnm],
			strokeColor: color,
			strokeWeight: 5
		}, props));

		google.maps.event.trigger(self.map[mnm], 'resize');
		markersBounds && self.map[mnm].fitBounds(markersBounds);
		self.map[mnm].markersBounds = markersBounds;
	};


	function removeMarkers(){
		self.infoWindow.close();
		for(var i = 0, l = self.markers.length; i < l; i++){
			self.markers[i].setMap(null);
		}
		self.markers = [];
	};


	function removeRoute(){
		self.map[mnm].route && self.map[mnm].route.setMap(null);
		self.map[mnm].route = null;
	};


	/* refresh map on show */
	function setRefreshMap(mapContainerId){
		$rootScope.$watch(function(){
			var el = document.getElementById(mapContainerId);
			return (el && (el.className.indexOf('ng-hide') === -1));
		}, function(newVal, oldVal){
			if(newVal && !oldVal && $window.google && $window.google.maps && self.map[mnm]/* && !$window[mapName].refreshed*/){
				google.maps.event.trigger(self.map[mnm], 'resize');
				self.map[mnm].refreshed = true;
			}
		});
	};


	function geocode(location, address){
		var dfd = $q.defer();

		if(!location && !address){
			dfd.reject({status: 'ERROR', msg: lang('Invalid location parameter')});
			return dfd.promise;
		}

		function geocodeCallback(result, status){
			var msg = self.geocoderStatuses[status];
			if(status === 'OK'){
				if(self.geocoderCache.data.location){
					result.isCached = true;
					self.geocoderCache.location.unshift({
						lat: self.geocoderCache.data.location.lat,
						lng: self.geocoderCache.data.location.lng,
						result: result
					});
					(self.geocoderCache.location.length > self.geocoderCacheSize) && self.geocoderCache.location.pop();
					Storage.set('geocoderCacheLocation', self.geocoderCache.location, false);
				}else if(self.geocoderCache.data.address){
					result.isCached = true;
					var location = __.getObjVal(result, [0, 'geometry', 'location']);
					if(location){
						__.defineObj(result, [0, 'geometry', 'lat'], location.lat());
						__.defineObj(result, [0, 'geometry', 'lng'], location.lng());
					}
					self.geocoderCache.address.unshift({
						address: self.geocoderCache.data.address,
						result: result
					});
					(self.geocoderCache.address.length > self.geocoderCacheSize) && self.geocoderCache.address.pop();
					Storage.set('geocoderCacheAddress', self.geocoderCache.address, false);
				}
				dfd.resolve({result: result, status: status, msg: msg});
			}else{
				dfd.reject({result: result, status: status, msg: msg});
			}
		};

		load().then(function(){
			var cacheItem = searchInGeocoderCache(location, address);
			if(cacheItem){
				self.geocoderCache.data = {};
				geocodeCallback(cacheItem, 'OK');
			}else{
				!self.geocoder && (self.geocoder = new google.maps.Geocoder());
				self.geocoderCache.data = location ? {location: location} : {address: address};
				self.geocoder.geocode(location ? {location: location} : {address: address}, geocodeCallback);
			}
		});

		return dfd.promise;
	};


	function searchInGeocoderCache(location, address){
		if(location){
			for(var i = 0, l = self.geocoderCache.location.length; i < l; i++){
				var item = self.geocoderCache.location[i];
				if(item.lat === location.lat && item.lng === location.lng){
					return item.result;
				}
			}
		}else if(address){
			for(var i = 0, l = self.geocoderCache.address.length; i < l; i++){
				var item = self.geocoderCache.address[i];
				if(item.address === address){
					var lat = __.getObjVal(item.result, [0, 'geometry', 'lat'], 0),
					    lng = __.getObjVal(item.result, [0, 'geometry', 'lng'], 0);
					__.defineObj(item.result, [0, 'geometry', 'location', 'lat'], function(){return lat;});
					__.defineObj(item.result, [0, 'geometry', 'location', 'lng'], function(){return lng;});
					return item.result;
				}
			}
		}
		return false;
	};


	function showLocationOnMap(obj){
		obj = obj || {};

		var mapCb = {
			click: function(e, map){
				map.setOptions({scrollwheel: true});
			},
			mouseout: function(e, map){
				map.setOptions({scrollwheel: false});
			}
		};
		var mapDfd = getMap(null, null, {scrollwheel: false}, mapCb);

		mapDfd.then(function(map){
			removeMarkers();
			var callbacks = {dragend: onMarkerDragend},
			    lat = __.getObjVal(obj, 'lat', null),
			    lng = __.getObjVal(obj, 'lng', null);

			if(lat === null || lng === null){
				obj.lat = Config.defaults.location.lat;
				obj.lng = Config.defaults.location.lng;
			}
			var marker = {
				lat: obj.lat,
				lng: obj.lng,
				options: {draggable: true},
				userData: obj
			};
			$timeout(function(){
				removeMarkers();
				setMapMarkers([marker], null, null, callbacks);
			}, 300);
		});
	};


	function geocodeAddress(item){
		var address = __.getObjVal(item, 'address');
		if(!address) return false;

		if(address instanceof Object){
			var addressArr = [];
			addressArr.push(address.country, address.zipcode, address.state, address.city, address.street);
			address = addressArr.join(' ');
		}

		geocode(null, address).then(function(res){
			var location = __.getObjVal(res, ['result', 0, 'geometry', 'location']);
			if(!location) return;
			item.lat = location.lat();
			item.lng = location.lng();
			showLocationOnMap(item);
		});
	};


	function onMarkerDragend(e, marker){
		$timeout(function(){
			var pos = marker.getPosition();
			marker.userData.lat = pos.lat();
			marker.userData.lng = pos.lng();
		});
	};
});