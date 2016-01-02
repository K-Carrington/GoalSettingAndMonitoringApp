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

		self.d3_displayed = {};

		self.setGraph = function(goal_id) {
		  if (!self.d3_displayed[goal_id]) {
  		  // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

        // Parse the date / time (e.g.  2015-12-18T03:30:34.430Z)
        var parseDate = d3.time.format("%Y-%m-%d").parse;

        // Set the scale ranges
        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        // Define the axes
        var xAxis = d3.svg.axis().scale(x)
          .orient("bottom");
        var yAxis = d3.svg.axis().scale(y)
          .orient("left");

        // Define the lines
        var hrsline = d3.svg.line()
          .x(function(d) { return x(d.m_date); })
          .y(function(d) { return y(d.hours_devoted); });

        var qline = d3.svg.line()
          .x(function(d) { return x(d.m_date); })
          .y(function(d) { return y(d.quality); });

        var resline = d3.svg.line()
          .x(function(d) { return x(d.m_date); })
          .y(function(d) { return y(d.percieved_result); });

	      // Get the data
	      d3.json('/api/goals/'+goal_id, function(error, goal){ 
	      	if (error) throw error;

	        //*** don't draw canvas or graph if no data ***
	      	if (goal.monitoring.length <= 1) return;
	  
	        // Adds the svg canvas
	        var svg = d3.select("#monitoring-chart"+goal_id)
	          .append("svg")
	            .attr("width", width + margin.left + margin.right)
	            .attr("height", height + margin.top + margin.bottom)
	          .append("g")
	            .attr("transform", 
	                "translate(" + margin.left + "," + margin.top + ")");

          goal.monitoring.forEach(function(d, i) {
            //chop date
            var trimmed_date = d.m_date.substring(0, 10);
            //console.log("trimmed_date="+trimmed_date)
            d.m_date = parseDate(trimmed_date);

            // add data progrssivly, divide quality and percieved result by 10
            if (i === 0) {
            	goal.monitoring[i].quality = goal.monitoring[i].quality/10;
              goal.monitoring[i].percieved_result = goal.monitoring[i].percieved_result/10;
            }

            if (i > 0) {
              goal.monitoring[i].hours_devoted += goal.monitoring[i-1].hours_devoted;
              goal.monitoring[i].quality += goal.monitoring[i-1].quality/10;
              goal.monitoring[i].percieved_result += goal.monitoring[i-1].percieved_result/10;
            }
          });

          // Scale the range of the data (scale y on hours devoted since that
          	// should be the largest value)
          x.domain(d3.extent(goal.monitoring, function(d) { return d.m_date; }));
          y.domain([0,
            d3.max(goal.monitoring, function(d) { return d.hours_devoted; })]);

					svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(0," + height + ")")
					      .call(xAxis);

					svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(5, 0)")
					    .append("text")
					      .text("Blue is cumulative hours devoted");
					svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(5, 20)")
					    .append("text")
					      .text("Green is cumulative scaled quality");
					svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(5, 40)")
					    .append("text")
					      .text("Purple is cumulative scaled result");

				  svg.append("g")
				      .attr("class", "y axis")
				      .call(yAxis)
				    .append("text")
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", ".71em")
				      .style("text-anchor", "end");
				      //.text("Monitoring");

				  svg.append("path")
				      .attr("class", "hrsline")
				      .attr("d", hrsline(goal.monitoring) )
				      .attr('stroke', 'blue')
				      .attr('stroke-width', 5.0)
				      .attr('fill', 'none')
				  svg.append("path")
				      .attr("class", "qline")
				      .attr("d", qline(goal.monitoring) )
				      .attr('stroke', 'green')
				      .attr('stroke-width', 4.0)
				      .attr('fill', 'none')
				  svg.append("path")
				      .attr("class", "resline")
				      .attr("d",  resline(goal.monitoring) )
				      .attr('stroke', 'purple')
				      .attr('stroke-width', 3.5)
				      .attr('fill', 'none')
				});
        self.d3_displayed[goal_id] = true;
      }
      else {
      	//  erase graph (<br> keeps buttons aligned...)
      	document.getElementById("monitoring-chart"+goal_id).innerHTML = "<br>";
      	self.d3_displayed[goal_id] = false;
      }
    }


		

        //******** THIS ONE CURRENTLY NOT USED *************
        self.setChart = function(goal_id) { // user_id ) {
	      if (!self.d3_displayed) {
        	console.log('In setChart, goal_id= '+goal_id)

        	//***This doesn't work on user logged in section routes:
		    // d3.json('/api/goals/users/'+user_id, function(error, data){ //Get data from given route,  // get all goals for a user
		    //d3.json('/api/goals/'+goal_id, function(error, data){ //Get data from given route,
		    d3.json('/api/goals/'+goal_id, function(error, goal){ //Get data from given route,
			                               // get given goal
			if(error) throw error;
 		 	//console.log(data);
 		 	console.log(goal);

			var hrs = [];
			var dates = [];
			var p_quals = [];
			var p_results = [];

			//all_hrs = data.map(function(goal){
			//	var hrs = []
				hrs = goal.monitoring.map(function(monitor){
					return monitor.hours_devoted;
				})
				dates = goal.monitoring.map(function(monitor){
					return monitor.m_date;
				})
				console.log("dates: "+dates);
				p_quals = goal.monitoring.map(function(monitor){
					return monitor.quality;
				})
				p_results = goal.monitoring.map(function(monitor){
					return monitor.percieved_result;
				})

			//	return hrs
			//})
			console.log(hrs)
			
			//Width and height
			var w = 500;
			var h = 100;
			
			var svg = d3.select("#monitoring-chart"+goal_id) //selecting entire div from D3
						.append("svg") //appending SVG to the body
						.attr("width", w) //setting the width of the svg
						.attr("height", h) //setting the height of the svg
			svg.selectAll("rect")
				//.data(hrs[0]) //set the data source to be the array of hours
				.data(hrs) //set the data source to be the array of hours
				.enter() //entering the data set to drill
				.append("rect") //appending a rectangle for each hour
				.attr("x", function(d, i){ //spacing between bars
				 	return i*30 
				}) //initial set of x axis
				.attr("y",0) //initial set of y axis
				.attr("width", 20) //initial width of rect
				.attr("height", function(d, i){
					//return d/10
					return d*10; //changing this helped, prolly make it even or up to *5
				}) //inital height of rect		
		    })
            self.d3_displayed = true;
          }
          else {
          	self.d3_displayed = false;
          }
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
