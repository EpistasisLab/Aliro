'use strict';
define(['angular', 'datatables'], function(angular, datatables) {
    angular.module('myApp.gp', ['datatables']).controller('jobController', WithJobController);
    function WithJobController($scope, DTOptionsBuilder, DTColumnBuilder) {
        var vm = this;
        vm.dtOptions = DTOptionsBuilder.fromSource('/Gp/data/jobs')
            .withOption('rowCallback', rowCallback)
            .withPaginationType('full_numbers');

        vm.dtColumns = [ 
            DTColumnBuilder.newColumn('job_id').withTitle('CAS Number'),
            DTColumnBuilder.newColumn('name').withTitle('description'),
            DTColumnBuilder.newColumn('num').withTitle('count')
        ];  
    function someClickHandler(info) {
        console.log(info)
    }   
    function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $('td', nRow).unbind('click');
        $('td', nRow).bind('click', function() {
            $scope.$apply(function() {
                someClickHandler(aData);
            }); 
        }); 
        return nRow;
    }   
    }   

});
