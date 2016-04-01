'use strict';

define(['angular'], function (angular) {
	
	/* Services */

	// Demonstrate how to register services
	// In this case it is a simple value service.
	angular.module('myApp.services', [])
		.value('version', '0.1')
.factory('focus', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
console.log('foo');
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  });
});
