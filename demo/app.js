/**
 * Created by zieglerc on 09/07/15.
 */
(function (angular) {

    'use strict';

    angular.module('DemoApp', ['ui.router', 'template-prefetch'])
        .config(function ($stateProvider, TemplatePrefetchProvider, $logProvider, $urlRouterProvider) {

            $logProvider.debugEnabled(true);

            // Make sure non-matching urls redirect to '#/'
            $urlRouterProvider.otherwise('/');

            // Define all states
            $stateProvider
                .state('main', {
                    url: '/',
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl'
                })
                .state('flow', {
                    url: '/flow?i',
                    templateUrl: function ($stateParams) {
                        var stepNumber = $stateParams.i || 1;
                        return 'views/flow-step' + stepNumber + '.html';
                    }
                })
                .state('abstractList', {
                    abstract: true,
                    templateUrl: 'views/list-parent.html'
                })
                .state('list', {
                    parent: 'abstractList',
                    url: '/list',
                    views: {
                        list: {
                            templateUrl: 'views/list.html'
                        },
                        details: {
                            templateUrl: 'views/details.html'
                        }
                    }
                });

            // Configure all valid transitions
            TemplatePrefetchProvider.from('main').to('flow').to('list');

        })
})(angular);