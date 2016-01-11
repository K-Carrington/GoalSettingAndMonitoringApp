(function() {
  'use strict';

  angular.module('app.routes', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', goalRoutes])

    function goalRoutes($routeProvider, $locationProvider){
      $routeProvider
        //
        // Users:
        //
        // sign up page
        .when('/signup', {
          templateUrl : 'partials/sign-up.html',
          controller : 'userCreateController',
          controllerAs : 'userCreateCtrl'
        })
        // login page
        .when('/login', {
          templateUrl : 'partials/login.html',
          controller : 'mainController',
          controllerAs: 'login'
        })
        // show all users
        .when('/users', {
          templateUrl: 'partials/home.html',
          controller: 'userController',
          controllerAs: 'user'
        })

        //
        // Goals:
        //
        // home page w/o logging in
        .when('/home', {
          templateUrl : 'partials/home.html',
          controller : 'goalsController',
          controllerAs : 'goalsCtrl'
        })
        // profile page when logged in
        // goal and goal-monitoring display
        .when('/profile', {
          templateUrl : 'partials/profile.html',
          controller : 'goalsController',
          controllerAs : 'goalsCtrl'
        })
        // goal add form
        .when('/addgoal', {
        templateUrl: 'partials/goal-add.html',
        controller: 'goalsController',
        controllerAs: 'goalsCtrl'
        })
        // goal edit form
        .when('/editgoal/:goalId', {
          templateUrl : 'partials/goal-update.html',
          controller : 'goalsController',
          controllerAs : 'goalsCtrl'
        })
        // monitor edit form
        .when('/editstatus/:goalId/:statusIndex', {
          templateUrl : 'partials/monitor-update.html',
          controller : 'goalsController',
          controllerAs : 'goalsCtrl'
        })
        // goal monitor form
        .when('/monitor', {
          templateUrl : 'partials/monitor-add.html',
          controller : 'goalsController',
          controllerAs : 'goalsCtrl'
        })
        // home page w/o logging in
        .otherwise({
          redirectTo: '/home'
        })
    }
}());
