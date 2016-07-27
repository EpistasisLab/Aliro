'use strict';

define(['angular', 'app'], function(angular, app) {

	return app.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/job_map', {
			templateUrl: '/Gp/pages/job_map.html',
		});
		$routeProvider.otherwise({redirectTo: '/job_map'});
	}]);

});
