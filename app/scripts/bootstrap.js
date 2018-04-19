(function(){
	window.globalVars = {
		appName: 'aama',
		isCordova: typeof cordova !== 'undefined' || typeof phonegap !== 'undefined'
	};
	window.globalVars.html5mode = !this.isCordova;

	if(window.globalVars.html5mode){
		var baseNode = document.querySelector('base');
		baseNode.href = '/';
	}
})();

window.onload = function(){
	function bootstrap(){
		angular.bootstrap(document, [window.globalVars.appName]);
	};
	window.globalVars.isCordova ? document.addEventListener('deviceready', bootstrap, false) : bootstrap();
};