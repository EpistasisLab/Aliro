// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {

        'd3': 'libs/d3',
        'queue':"libs/queue.min",
        'angular': 'libs/angular/angular',
        'angularDatatables': 'libs/angular/angular-datatables',
        'angularDirective': 'libs/angular/angular-datatables.directive',
        'angularDatatablesInstances': 'libs/angular/angular-datatables.instances',
        'angularDatatablesUtil': 'libs/angular/angular-datatables.util',
        'angularDatatablesRenderer': 'libs/angular/angular-datatables.renderer',
        'angularDatatablesFactory': 'libs/angular/angular-datatables.factory',
        'angularDatatablesOptions': 'libs/angular/angular-datatables.options',
        'angularRoute': 'libs/angular/angular-route',
        'bootstrap': "libs/bootstrap",
        'datatables': "libs/jquery/jquery.dataTables"
    },
    map: {
        '*': {
            'css': 'plugins/requirecss/css'
        }
    },

    shim: {
        "bootstrap": {
            deps: ["jquery"]
        },
        "datatables": {
            deps: ["jquery"]
        },
        "datatables-bootstrap": {
            deps: ['jquery', 'datatables', 'bootstrap']
        },
        "angularDatatables": {
            deps: ['angular', 'jquery', 'datatables', 'angularDirective', 'angularDatatablesInstances', 'angularDatatablesUtil', 'angularDatatablesRenderer', 'angularDatatablesFactory', 'angularDatatablesOptions']
        },
        "angularDatatablesOptions": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "angularDatatablesInstances": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "angularDatatablesFactory": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "angularDatatablesRenderer": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "angularDatatablesUtil": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "angularDirective": {
            deps: ['angular', 'jquery', 'datatables']
        },
        "reusable_chart": {
            deps: ['d3']
        },
        "queue": {
            deps: ['d3']
        },
        'angular': {
            'exports': 'angular'
        },
        'angularRoute': ['angular'],

    },
    priority: [
        "angular"
    ]
});
window.name = "NG_DEFER_BOOTSTRAP!";

require([
    'jquery',
    'underscore',
    'app',
    'routes',
    'datatables',
    'angularDatatables',
    'd3',
    'gp',
], function($, _, app, routes, datatables, angularDatatables, d3) {
    //angular.element(document.getElementById('foof'));
    var initialize = function() {
        console.log('loading main.js')
    };
    angular.element().ready(function() {
        initialize();
        angular.resumeBootstrap([app['name']]);
    });

});
