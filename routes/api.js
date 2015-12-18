var
	express 	= require('express'),
	apiRouter  	= express.Router(),
	mongoose 	= require('mongoose'),
	Goal 		= require('../models/goal.js'),
	User 		= require('../models/user.js'),
	jwt        	= require('jsonwebtoken'),
	superSecret	= 'frijoles'

apiRouter.get('/', function(req,res){
	res.json({message: "Api routes are working."})
});

// ---------------------------api routes to create a user ---------------------------------------------
// route to generate sample user
// ***Take out after dev & test
apiRouter.post('/sample', function(req, res) {
	// look for the user named test
	User.findOne({ 'username': 'test' }, function(err, user) {
		// if there is no test user, create one
		if (!user) {
			var sampleUser = new User();

			sampleUser.name = 'test';
			sampleUser.username = 'test';
			sampleUser.password = 'test';

			sampleUser.save(function(err) {
				if (err) {res.send(err);}
			});
		} else {
			console.log(user);

			// if there is a test user, update the password
			user.password = 'test';
			user.save(function(err) {
				if (err) {res.send(err);}

				// return a message
				else {res.json({ message: 'Test User updated!' });}
			});
		}
		res.send('done')
	});
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/authenticate', function(req, res) {
	// find the user
	User.findOne({
		username: req.body.username
	}).select('name username password').exec(function(err, user) {
		if (err) throw err;

		// no user with that username was found
		if (!user) {
			res.json({
				success: false,
				message: 'Authentication failed. User not found.'
			});
		} else if (user) {
			// check if password matches
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.json({
					success: false,
					message: 'Authentication failed. Wrong password.'
				});
			} else {
				// if user is found and password is right
				// create a token
				var token = jwt.sign({
					name: user.name,
					username: user.username,
					user_id: user._id    //TBD can get this out of local storage
				}, superSecret, {
					expiresInMinutes: 1440 // expires in 24 hours
				});

				// return the information including token as JSON
				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token,
					username: user.username,
					user_id: user._id
				});
			}
		}
	});
});

// on routes that end in /users
// ----------------------------------------------------
apiRouter.route('/users')
	// create a user (accessed at POST http://localhost:8080/users)
	.post(function(req, res) {
		console.log('creating user =======');
		var user = new User();		// create a new instance of the User model
		user.name = req.body.name;  // set the users name (comes from the request)
		user.username = req.body.username;  // set the users username (comes from the request)
		user.password = req.body.password;  // set the users password (comes from the request)

		user.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else {
					console.log('error =============', err);
					return res.send(err);
				}
			}

			// return a message
			res.json({ message: 'User created!' });
		});
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	// TBD might be able to get rid of this one
	.get(function(req, res) {
		User.find({})
			.populate('goals')
			.exec(function(err, users) {
			if (err) {res.send(err);}

			// return the users w/o goals, the with goals version is another route below
			else {res.json(users);}
		})
	})


// ---------------------------api routes to login a user ---------------------------------------------
////**All routes above this do not require a token to get access**
// all of the goals (or the ones that require user login) above should be moved below this
// route middleware to verify a token
apiRouter.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, superSecret, function(err, decoded) {

			if (err) {
				res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
			});
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;

				next(); // make sure we go to the next routes and don't stop here
			}
		});
	} else {
		// if there is no token
		// return an HTTP response of 403 (access forbidden) and an error message
		res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});




// on routes that end in /users/:user_id
// ----------------------------------------------------
apiRouter.route('/users/:user_id')
	// get the user with that id
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) {res.send(err);}

			// return that user
			else {res.json(user);}
		});
	})

	// update the user with this id
	.put(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) {res.send(err);}
			else {

			  // set the new user information if it exists in the request
			  if (req.body.name) user.name = req.body.name;
			  if (req.body.username) user.username = req.body.username;
			  if (req.body.password) user.password = req.body.password;

			// save the user
			  user.save(function(err) {
				if (err) res.send(err);

				// return a message
				res.json({ message: 'User updated!' });
			  });
			}
		});
	})

	// delete the user with this id
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) {res.send(err);}

			else {res.json({ message: 'Successfully deleted' });}
		});
	});

// api endpoint to get user information
// this is called from authService.js authFactory.getUser
apiRouter.get('/me', function(req, res) {
	// Get user via req.decoded.user_id
	User.findOne({ _id: req.decoded.user_id})
	  .populate('goals')
	  .exec(function (err, user) {
        if (err) {res.send(err);}
        else {
          console.log('in me route, Populated user with goals', user);
          res.json(user);
        }
      })
	//res.send(req.decoded);
});

// ----------------------------------------------------------------------------------------------------
// ---------------------------api routes for a users goals --------------------------------------------
//Read all and Create one (Also use this for cycling through all users)
//TBD In Angular get user id from token
apiRouter.route('/goals/users/:user_id')
	.get(function(req,res){
		User.findOne({ _id: req.params.user_id})
		  .populate('goals')
		  .exec(function (err, user) {
          if (err) {res.send(err);}
          else {
            console.log('Populated user with goals', user);
            res.json(user.goals);
          }
        })
	})
	.post(function(req,res){
		// post a new goal for the user
		var newGoal = new Goal
		newGoal.parent_categories_heirachy = req.body.parent_categories_heirachy
		newGoal.goal_or_task = req.body.goal_or_task
		newGoal.date_created = req.body.date_created
		newGoal.zen_level = req.body.zen_level
		newGoal.reminder = req.body.reminder
		newGoal.optional_due_date = req.body.optional_due_date
		newGoal.completed = req.body.completed
		newGoal.priority = req.body.priority

		newGoal.user_id = req.params.user_id
		//To test in postman
/*	  {
      "parent_categories_heirachy": "Learn Web/Learn Angular/Write an app",
      "goal_or_task": "test routes in postman",
      "zen_level": 2,
      "reminder": false,
      "completed": false,
      "priority": 10,
      "user_id": "566f35206eb17518050f7ebe"  ***Update to user in question***
    }
*/
		newGoal.save(function(err) {
			if (err) {res.send(err)}
			else {res.json({message: 'Goal record saved!'})}
		});

		// attach to given user, then save user
		User.findById(req.params.user_id, function(err, user) {
			if (err) {res.send(err);}
            else {
              user.goals.push(newGoal);

			  // save the goal updated user
			  user.save(function(err) {
				if (err) {res.send(err);}
			  });
            }
		});
	})

// ---------------------------api routes for individual goals -----------------------------------------
//Read one, Update one and Delete one

apiRouter.route('/goals/:id')
	.get(function(req,res){
	  Goal.findOne({ _id: req.params.id })
        .populate('user_id')
        .exec(function (err, goal) {
        if (err) {res.send(err);}
        //console.log('Populated goal with user %s', goal.user_id.name);
		else {
			res.json(goal)
		}
      });
	})
	.patch(function(req,res){
		Goal.findOneAndUpdate({_id: req.params.id}, req.body, function(err,goal){
			if(err) throw err
			Goal.findById(req.params.id, function(err,updatedGoal){ //to return updated goal
				res.json(updatedGoal)
			})
		})
	})
	.delete(function(req,res){
	  //delete from user.goals
	  console.log("params", req.params);
      Goal.findById( req.params.id, function(err, goal) {
	    if (err) {
	      console.log("ERROR findng goal, err = "+err)
	  	  res.send(err);
	    }
        else if (!goal){
          console.log("ERROR: cannot delete null goal")
		  res.send("ERROR: cannot delete null goal")
	    }else{
	      console.log("looking for user that goal = "+goal+" belongs to ")
          User.findById(goal.user_id, function(err, user) {
		    if (err) {
		    	console.log("ERROR finding user, err = "+err)
		    	res.send(err);
		    }
		    else {
              console.log("found user to delete goal out of, len " + user.goals.length)
              for (var i = 0; i < user.goals.length; i++) {
        	    console.log("ids "+user.goals[i] +", "+ req.params.id)
        	    if (user.goals[i] == req.params.id) { //*** not the same so only == ***
                  user.goals.splice(i, 1);
                  console.log("spliced out "+i+" indexed goal")
                  continue;
                }
              }
	          // save the goal deleted user
	          user.save(function(err) {
		        if (err) {res.send(err);}
		        else {
		          console.log("Deleted goal out of user array!")
		          //delete from goal collection
		  	      Goal.findOneAndRemove({_id: req.params.id}, req.body, function(err,goal){
			        if(err) throw err
			        res.json({message:"goal deleted!"})
		          })
		        }
	          });
	        }
	      });
		}
      });
	})

//TBD probably won't need
/* db.users.update({"_id": ObjectId("566f35206eb17518050f7ebe")}, {$set: {"goals": []}})
apiRouter.get('/users/:user_id/destroy-all-goals', function(req,res){
	//TBD remove all goals for given user
	Goal.remove({}, function(err){
		if(err) throw err
		res.json({message: 'All user\'s goals destroyed!'})
	})
})
*/

module.exports = apiRouter
