//goals.js
(function() {
	'use strict';
	angular.module('goals', [])
		.directive('navBar', navBar)
		.directive('goalForm', goalForm)
		.directive('monitorForm', monitorForm)
		.filter('reverse', reverse)

	function reverse() {
		return function(items) {
			if (items == undefined)
				return null;
			else
				return items.slice().reverse();
		};
	}


	function goalForm(){
		var directive = {
			restrict: 'E',
			templateUrl: '/partials/add-update-goal-form.html'
		}
		return directive
	}

	function monitorForm(){
		var directive = {
			restrict: 'E',
			templateUrl: '/partials/add-update-monitor-form.html'
		}
		return directive
	}

	function navBar(){
		var directive = {
			restrict: 'E',
			templateUrl: '/partials/nav.html',
			transclude: true
		}
		return directive
	}

}());

