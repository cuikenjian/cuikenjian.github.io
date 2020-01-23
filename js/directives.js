angular.module('catchBaby.directives', [])
    .directive('startDialog', function() {
        return {
            restrict: 'E',
            templateUrl: 'tempelate/start_dialog.html'
        }
    })
    .directive('endDialog', function() {
        return {
            restrict: 'E',
            templateUrl: 'tempelate/end_dialog.html',
            scope: {
                result: '='
            }
        }
    });