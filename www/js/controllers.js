'use strict';
define(['angular', 'datatables'], function (angular, datatables) {
	angular.module('myApp.controllers', ['myApp.services'])
		// Sample controller where service is being used
		.controller('versionController', ['$scope', 'version', function ($scope, version) {
			$scope.scopedAppVersion = version;
		}])
});
