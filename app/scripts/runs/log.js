'use strict';

App.run(function($window, $rootScope, Config){
	if(Config.debug && !document.querySelector('#debugger')){
		(function(){
			var debugEl = document.querySelector('#debugger'),
				loggerEl = document.querySelector('#logger'),
				debugSwitchEl = document.querySelector('#debugger-switcher');
			debugEl = document.createElement('div');
			debugEl.id = 'debugger';
			debugEl.className = 'debugger';
			debugEl.innerHTML = '<div id="logger" class="logger"></div><div id="debugger-switcher"></div><div class="clear-btn"><button>Clear</button></div>';
			document.body.appendChild(debugEl);
			loggerEl = document.querySelector('#logger');
			debugSwitchEl = document.querySelector('#debugger-switcher');
			debugEl.querySelector('button').onclick = function(){
				loggerEl.innerHTML = '';
				debugSwitchEl.style.zoom = 1;
			};
			var css = '\
			#debugger{\n\
				position: fixed;\n\
				z-index: 100000;\n\
				top: 0px;\n\
				bottom: 0px;\n\
				right: 0px;\n\
				-webkit-transform: translate3d(100%, 0, 0);\n\
				transform: translate3d(100%, 0, 0);\n\
				-webkit-transition: transform 0.2s ease;\n\
				transition: transform 0.2s ease;\n\
				z-index: 2000;\n\
				background-color: rgba(255,255,255,.8);\n\
				width: 80%;\n\
				color: #000;\n\
			}\n\
			#logger{\n\
				border: 1px solid #ccc;\n\
				overflow: auto;\n\
				position: absolute;\n\
				top: 0px;\n\
				left: 0px;\n\
				right: 0px;\n\
				bottom: 40px;\n\
			}\n\
			#logger:empty + #debugger-switcher{\n\
				background-color: rgba(255,255,0,.4);\n\
			}\n\
			#debugger-switcher{\n\
				content: "";\n\
				display: block;\n\
				position: absolute;\n\
				-webkit-transform: translateZ(0);\n\
				transform: translateZ(0);\n\
				z-index: 100000;\n\
				left: -40px;\n\
				top: 80px;\n\
				width: 40px;\n\
				height: 40px;\n\
				background-color: rgba(255,0,0,.4);\n\
				border-radius: 50%;\n\
			}\n\
			#debugger .log-event{\n\
				border-top: 1px dashed #ccc;\n\
			}\n\
			#debugger .log-event pre{\n\
				line-height: 1;\n\
				background-color: transparent;\n\
				border: none;\n\
				padding: 5px;\n\
				font-size: 10px;\n\
				margin: 0;\n\
			}\n\
			#debugger .clear-btn{\n\
				text-align: center;\n\
				position: absolute;\n\
				bottom: 0px;\n\
				left: 0px;\n\
				right: 0px;\n\
			}\n\
			#debugger .clear-btn button{\n\
				width: 100%;\n\
				height: 40px;\n\
			}';
			var styleElem = document.createElement('style');
			styleElem.type = 'text/css';
			styleElem.styleSheet ? styleElem.styleSheet.cssText = css : styleElem.appendChild(document.createTextNode(css));
			document.querySelector('head').appendChild(styleElem);

			debugSwitchEl.onclick = function(){
				var style = window.getComputedStyle(debugEl).transform || window.getComputedStyle(debugEl)['-webkit-transform'] || '';
				var matrix = style.replace(/matrix\((.*)\)/ig, '$1');
				if(matrix){
					var matrixArr = matrix.split(',');
					debugEl.style['-webkit-transform'] = debugEl.style.transform = (matrixArr[4] && parseInt(matrixArr[4])) ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)';
				}
			};
		})();
	}

	$window.log = function(obj, prefix, prettyJson, showTime, debugOnly){
		(typeof prettyJson === 'undefined') && (prettyJson = true);
		(typeof debugOnly === 'undefined') && (debugOnly = true);
		(typeof showTime === 'undefined') && (showTime = true);

		if(!Config.debug && debugOnly) return false;

		prefix = prefix || '';
		showTime && (prefix = (new Date()).toLocaleTimeString() + ' ' + prefix);
		prefix && (prefix = prefix + ': ');

		if(typeof obj === 'object' && obj){
			try{
				var json = angular.toJson(obj, prettyJson);
			}catch(err){
				json = obj.toString();
			}
			var msg = prefix + json;
		}else{
			msg = prefix + obj;
		}
		//($rootScope.deviceInfo.device === 'desktop') ? console.log(prefix, obj) : console.log(msg);
		console.log(msg);

		if(Config.debug){
			var loggerEl = document.querySelector('#logger'),
				debugSwitchEl = document.querySelector('#debugger-switcher');
			var logEl = document.createElement('div');
			logEl.className = 'log-event';
			logEl.innerHTML = '<pre>' + msg + '</pre>';
			loggerEl.appendChild(logEl);
			loggerEl.scrollTop = loggerEl.scrollHeight;
			debugSwitchEl.style.zoom = 1;
		}

		return msg;
	};
});
