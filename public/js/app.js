angular.module('goalsApp', ['app.routes', 'mainCtrl'])

// application configuration to integrate token into requests
// .config(function($httpProvider) {
//
//   // attach our auth interceptor to the http requests
//   $httpProvider.interceptors.push('authInterceptor')
//
// });