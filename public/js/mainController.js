angular.module('mainCtrl', [])
  .controller('mainController', function($rootScope, $location, auth){
    var mainCtrl = this;
    mainCtrl.l = "Hello"

    // get info if a person is logged in
    mainCtrl.loggedIn = auth.isLoggedIn()
    console.log( "Is Logged", mainCtrl.loggedIn )

    // check to see if a user is logged in on every request
    $rootScope.$on('$routeChangeStart', function(){
      mainCtrl.loggedIn = auth.isLoggedIn();

      // get user information on page load
      auth.getUser()
      .then(function(data){
        mainCtrl.user = data.data;
      });
    });

    // function to handle login form
    mainCtrl.doLogin = function(){
      mainCtrl.processing = true;

      // clear the error
      mainCtrl.error = '';

      // if a user successfully logs in, redirect to users page
      auth.login(mainCtrl.loginData.username, mainCtrl.loginData.password)
        .success(function(data){
          mainCtrl.processing = false;

          if(data.success) {
            document.getElementById( "loggedName" ).innerHTML = data.username
            document.getElementById( "unloggedSignUp" ).style.display = "none"
            document.getElementById( "loggedName" ).style.display = "block"

            //  document.getElementById( "loggedName" ).innerHTML = data.username
            $location.path('/profile');
          } else {
            mainCtrl.error = data.message;
          }
      });
    };

    // function to handle logging out
    mainCtrl.doLogout = function(){
      auth.logout();
      mainCtrl.user = '';

      $location.path('/home');
    };
  });
