angular.module('goalsApp', ['ngAnimate', 'app.routes', 'mainCtrl', 'userCtrl',
	'userService', 'authService', 'goalsCtrl', 'goals', 'goalsFactory'])

// application configuration to integrate token into requests
.config(function($httpProvider) {

	// attach our auth interceptor to the http requests
    $httpProvider.interceptors.push('authInterceptor')
});
