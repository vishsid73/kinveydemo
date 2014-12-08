/**
 * Created with JetBrains WebStorm.
 * User: siddharth
 * Date: 05/12/14
 * Time: 10:03 PM
 * To change this template use File | Settings | File Templates.
 */

var wbKinveyLogin = angular.module('wbKinveyLogin', ['kinvey','ngRoute']);

// added injector to manual bootstrap angular after kinvey.init() for getactiveuser()
//http://www.kinvey.com/blog/3541/kinvey-javascript-library-now-available-for-angularjs-web-apps


var $injector = angular.injector(['ng', 'kinvey']);
$injector.invoke(['$kinvey', function($kinvey) {
    $kinvey.init({
        appKey    : 'kid_-1uD789Fv',
        appSecret : '80666d15f07a4dd8a2daee7eee83156e'
    }).then(function() {
            angular.bootstrap(document, ['wbKinveyLogin']);
        });
}]);

//wbKinveyLogin.run(function($kinvey) {
//    // Initialize Kinvey for use in your app.
//    $kinvey.init({
//        appKey    : 'kid_-1uD789Fv',
//        appSecret : '80666d15f07a4dd8a2daee7eee83156e'
//    })
//});


wbKinveyLogin.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/log.tpl.html',
            controller: 'LoginCtrl'
        }).
        when('/partials/password_reset', {
            templateUrl: 'partials/forgot_password.tpl.html',
            controller: 'ResetPasswordController'
        }).
        when('/partials/sign_up', {
            templateUrl: 'partials/register.tpl.html',
            controller: 'SignUpController'
        }).
        when('/partials/logged_in', {
            templateUrl: 'partials/logged_in.tpl.html',
            controller: 'LoggedInController'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


wbKinveyLogin.controller('LoginCtrl', ['$scope', '$kinvey', '$location', function($scope, $kinvey, $location) {
    $scope.ping = function() {
        var promise = $kinvey.ping();
        promise.then(function(response) {
            alert('Kinvey Ping Success. Kinvey Service is alive, version: ' + response.version + ', response: ' + response.kinvey);
        }, function(error) {
            alert('Kinvey Ping Failed. Response: ' + error.description);
        });
    };


    $scope.login = function () {
        var isFormInvalid = false;

        //check is form valid
        if ($scope.loginForm.email.$error.email || $scope.loginForm.email.$error.required) {
            $scope.submittedEmail = true;
            isFormInvalid = true;
        } else {
            $scope.submittedEmail = false;
        }
        if ($scope.loginForm.password.$error.required) {
            $scope.submittedPassword = true;
            isFormInvalid = true;
        } else {
            $scope.submittedPassword = false;
        }
        if (isFormInvalid) {
            return;
        }

        console.log("call login");
        //Kinvey login starts
        var promise = $kinvey.User.login({
            username: $scope.username,
            password: $scope.password
        });
        promise.then(
            function (response) {
                //Kinvey login finished with success
                $scope.submittedError = false;
                //$location.path('/partials/logged_in');
                window.location.href='/app/';
            },
            function (error) {
                //Kinvey login finished with error
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log("Error login " + error.description);//
            }
        );
    }
}]);

wbKinveyLogin.controller('LoggedInController',
    ['$scope', '$kinvey', '$location', function($scope, $kinvey, $location)  {
        $scope.logout = function () {
            console.log("logout");

            //Kinvey logout starts
            var promise = $kinvey.User.logout();
            promise.then(
                function () {
                    //Kinvey logout finished with success
                    console.log("user logout");
                    $kinvey.setActiveUser(null);
                    $location.path("/");
                },
                function (error) {
                    //Kinvey logout finished with error
                    alert("Error logout: " + JSON.stringify(error));
                });
        }

        $scope.verifyEmail = function () {
            var user = $kinvey.getActiveUser();

            //Kinvey verifying email starts
            var promise = $kinvey.User.verifyEmail(user.username);
            promise.then(
                function() {
                    //Kinvey verifying email finished with success
                    alert("Email was sent");
                }
            );
        }

        $scope.username = $kinvey.getActiveUser().username ;

        $scope.showEmailVerification = function () {
            var activeUser = $kinvey.getActiveUser();

            if (activeUser != null) {
                //check is user confirmed email
                var metadata = new $kinvey.Metadata(activeUser);
                var status = metadata.getEmailVerification();
                console.log("User email " + status + " " + activeUser.email);
                if (status === "confirmed" || !(!!activeUser.email)) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }]);


wbKinveyLogin.controller('ResetPasswordController',
    ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
        $scope.resetPassword = function () {
            //check are form fields correct
            if ($scope.resetPasswordForm.email.$error.email || $scope.resetPasswordForm.email.$error.required) {
                $scope.submitted = true;
                return;
            }else{
                $scope.submitted = false;
            }
            //Kinvey reset password starts
            var promise = $kinvey.User.resetPassword($scope.email);
            promise.then(
                function () {
                    //Kinvey reset password finished with success
                    console.log("resetPassword");
                    $location.path("/partials/logged_in");
                });
        }
    }]);

wbKinveyLogin.controller('SignUpController',
    ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
        $scope.signUp = function () {
            console.log("signup");
            var isFormInvalid = false;

            //check is form valid
            if ($scope.registrationForm.email.$error.email || $scope.registrationForm.email.$error.required) {
                $scope.submittedEmail = true;
                isFormInvalid = true;
            } else {
                $scope.submittedEmail = false;
            }
            if ($scope.registrationForm.password.$error.required) {
                $scope.submittedPassword = true;
                isFormInvalid = true;
            } else {
                $scope.submittedPassword = false;
            }
            if (isFormInvalid) {
                return;
            }

            //Kinvey signup starts
            var promise = $kinvey.User.signup({
                username: $scope.email,
                password: $scope.password,
                email: $scope.email
            });
            console.log("signup promise");
            promise.then(
                function () {
                    //Kinvey signup finished with success
                    $scope.submittedError = false;
                    console.log("signup success");
                    $location.path("/partials/logged_in");
                },
                function(error) {
                    //Kinvey signup finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("signup error: " + error.description);
                }
            );
        }
    }]);