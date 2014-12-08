/**
 * Created with JetBrains WebStorm.
 * User: siddharth
 * Date: 05/12/14
 * Time: 10:03 PM
 * To change this template use File | Settings | File Templates.
 */

var wbKinvey = angular.module('wbKinvey', ['kinvey','ngRoute', 'ui.bootstrap', 'chart.js', 'angularCharts']);

// added injector to manual bootstrap angular after kinvey.init() for getactiveuser()
//http://www.kinvey.com/blog/3541/kinvey-javascript-library-now-available-for-angularjs-web-apps


var $injector = angular.injector(['ng', 'kinvey']);
$injector.invoke(['$kinvey', function($kinvey) {
    $kinvey.init({
        appKey    : 'kid_-1uD789Fv',
        appSecret : '80666d15f07a4dd8a2daee7eee83156e'
    }).then(function() {
            angular.bootstrap(document, ['wbKinvey']);
            determineBehavior($kinvey);
        });
}]);

//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey) {
    var activeUser = $kinvey.getActiveUser();
    if (activeUser == null) {
        console.log("activeUser null redirecting");
            window.location.href='/app/login.html';

    }
}



wbKinvey.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/admin_dash.tpl.html',
            controller: 'saveCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


wbKinvey.controller('navbarCtrl',
    ['$scope', '$kinvey', '$location', function($scope, $kinvey, $location)  {

        $scope.username = $kinvey.getActiveUser().username ;

        $scope.logout = function () {
            console.log("logout");

            //Kinvey logout starts
            var promise = $kinvey.User.logout();
            promise.then(
                function () {
                    //Kinvey logout finished with success
                    console.log("user logout");
                    $kinvey.setActiveUser(null);
                    window.location.href='/app/login.html';
                },
                function (error) {
                    //Kinvey logout finished with error
                    alert("Error logout: " + JSON.stringify(error));
                });
        }


    }]);

wbKinvey.controller('saveCtrl', function($scope, $kinvey, $location, $log){
    $scope.save = function(){

        var promise = $kinvey.DataStore.save('expense', {
        desc : $scope.desc,
        amount: $scope.amount,
        date: $scope.date
    });
    };




    $scope.getallexpense = $kinvey.DataStore.group('expense', $kinvey.Group.sum('amount')).then(function(){$scope.cal();});;

    var formdate = function(d1){
        var today = d1;
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }

        today = dd+'-'+mm+'-'+yyyy;
        return today;
    };

    $scope.labels = [];
    $scope.series = ['Weekly Expense'];
    $scope.data = [
        []
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    $scope.cal = function(){

        for(var i=0; i<7;i++){
            var d = new Date();
            d.setDate(d.getDate()-i);
            var str = formdate(d);
            $scope.labels.push(str);

            var query = new $kinvey.Query();
            query.equalTo('date', str).limit(1);
            var group = $kinvey.Group.sum('amount');
            group.query(query);
            var promise  = $kinvey.DataStore.group('expense', group);
                promise.then(function(data){
                    //console.log(data[0]);
                        if(data.length > 0){
//                        if (typeof data[0].result == 'undefined'){
//                            //$scope.labels.push(str);
                            $scope.data[0].splice(i, 0, data[0].result);

                    }
                    else
                            $scope.data[0].splice(i, 0, 0);


            });

            ;

        }


    };


});