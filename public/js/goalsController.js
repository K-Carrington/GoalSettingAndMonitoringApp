//goalsController.js
(function(){

	// add 2 controllers
	angular.module('goalsCtrl', [])
		.controller('goalsController', goalsController)
		//.controller('goalDetailController', goalDetailController)

	// inject both controllers with goals factory

  // these 2 both use the goals factory:
	//goalsController.$inject = ['goals', '$window']
	goalsController.$inject = ['goals','$routeParams', '$window', '$location'] //location is for rendering a new view

	function goalsController(goals, $routeParams, $window, $location){
		var self = this
		self.showModal = false;

		self.selectedMonitor = {};
		self.selectMonitor = function(goal, monitor){
			//console.log("In selectMonitor " + monitor)
			self.selectedMonitor = monitor
			self.selectedMonitor.goal = goal
			//console.log(self.selectedMonitor)
		}

		// self.toggleModal = function(){
		// 	console.log('show modal')
		// 		self.showModal = !self.showModal;
		// };

		self.name = 'Goal List'
		self.api = goals  //goals factory

		// for full list user's of goals from DB
		self.goals = []

		// all goals in the system
		self.all_goals = []

		// for a new goal to POST
		self.newGoal = {}

		// for the single goal being processed here
		self.goal = null

		//// get list of goals, and set this controller's 'goals' property to
		//// the array we get back from our API
		//self.api.list().success(function(response){  //call factory function
		//	self.goals = response
		//})

		self.showGoals = function(user_id){
	      self.api.list(user_id).success(function(response){  //call factory function
		  	self.goals = response.data
		  })
		}

	    self.api.list_all().success(function(response){  //call factory function
		  self.all_goals = response  //not in .data for some reason...
		})


		// controller method for adding a new goal, invoked when user hits submit
		//self.addGoal = function(parent_categories_heirachy, goal_or_task, date_created,
		//	zen_level, reminder, optional_due_date, completed, priority) {
		self.addGoal = function(user_id) {
			// set a high priority if completed so as to sort lower
			if (self.goal.completed) self.goal.priority = 11;

			// run the goal factory's addGoal method to send the POST request with the data object we just created
			self.api.addGoal(user_id, self.goal).then(function success(response){
				console.log('added a goal!')

				// when we successfully finish the POST request, take the server's response (the new goal) and add
				// it to this controller's goal list, which updates the front-end with the new goal
				self.goals.push(response.data.goal)
				// clear this controller's newGoal object, which clears the input fields on the front-end
				self.newGoal = {}
				// focus on the first input field for the user to add another goal (UI enhancement)
				$window.location = '/#/profile'
			})
		}

		// default boolean value, which we can toggle true/false for showing/hiding the goal edit form
		self.editing = false

        // Set up goal editing UI:
		// retrieve a goal via the url parameter for goalId, then set this controller's goal property
		// to the response in order to to show it on the front-end
		self.editGoal = function(goalId){
			self.api.show(goalId).success(function(response){
				self.goal = response
				console.log( response )
				$window.location = '#/editgoal/'+goalId
				self.zen_level = response.zen_level
			})
		}

		self.showGoal = function(goalId){
			self.api.show(goalId).success(function(response){
				self.goal = response
			})
		}
		//self.showGoal($routeParams.goalId)

		// update the goal, on successful PATCH, set the goal object to the response from the server,
		// which updates the front-end, then turn the editing property to false, which toggles back to
		// show the goal details without the edit form
		self.updateGoal = function() {
			// set a high priority if completed so as to sort lower
			if (self.goal.completed) self.goal.priority = 11;

			self.api.updateGoal(self.goal).success(function(response){
				console.log(response)
				self.goal = response
				self.editing = false
			
			$window.location = '/#/profile'
			//location.reload();
		  })
		}

        self.newMon = {}

		self.updateStatus = function(goal) {
            goal.monitoring.push(self.newMon)
            self.newMon = {} //clear out values for next one

			self.api.updateGoal(goal).success(function(response){
				self.goal = response
				self.editing = false
				alert("Monitoring added for " + response.monitoring[response.monitoring.length-1].m_date);
				location.reload();
			})
		}

		// delete the goal using this, then afterwards, redirect the user back to the same page
		self.removeGoal = function(goalId, user){
			var r = confirm("Delete Goal?");
			if (r == true) {
				self.api.removeGoal(goalId).success(function(response){
					console.log(response)
					// $location.path('/monitor')
					location.reload();
					self.showGoals( user._id )
				})
			} 
		}

		self.click = function( stuff ) {
			console.log( "Hello", stuff)
		}
	}
}())
