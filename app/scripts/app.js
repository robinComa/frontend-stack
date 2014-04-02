'use strict';

angular.module('app', [
    'ngRoute',
    'ngResource',
    'templates'
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

}]);