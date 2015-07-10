/**
 * Created by zieglerc on 09/07/15.
 */
(function (angular) {

    angular.module('DemoApp')
        .controller('MainCtrl', ['$scope', function ($scope, $state) {

            $scope.choice = 1;

            $scope.mainSubHref = function () {
                return $state.href('mainSub', {i: $scope.choice});
            }
        }]);

})(angular);
