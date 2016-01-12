//goalFactory.js
(function() {
	'use strict';

	angular.module('goalsFactory', [])
		.factory('goals', goals)  // a factory named goals

	goals.$inject = ['$http']

	// goals factory
	function goals($http){
		var goalsUrl = '/api/goals'
		var goals = {}

		goals.list_all = function() {
			console.log("calling http.get all goals")
			return $http.get(goalsUrl)
		}

        // list all for given user
		goals.list = function(user_id) {
			return $http.get(goalsUrl + '/users/' + user_id )
		}

		goals.show = function(goalId) {
			return $http.get(goalsUrl + '/' + goalId)
		}

		goals.addGoal = function(userId, goal) {
			return $http.post(goalsUrl + '/users/' + userId, goal)
		}

		goals.updateGoal = function(goal) {
			return $http.patch(goalsUrl + '/' + goal._id, goal)
		}

		goals.removeGoal = function(goalId) {
			return $http.delete(goalsUrl + '/' + goalId)
		}

		return goals
	}
}());

