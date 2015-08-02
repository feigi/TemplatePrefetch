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
                    params: {i: '1'},
                    templateUrl: function ($stateParams) {
                        return 'views/flow-step' + $stateParams.i + '.html';
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
                        "list": {
                            templateUrl: 'views/list.html'
                        },
                        "details": {}
                    }
                })
                .state('list.detailsA', {
                    url: '/details/a',
                    views: {
                        "details@abstractList": {
                            templateUrl: 'views/details-a.html'
                        }
                    }
                })
                .state('list.detailsB', {
                    url: '/details/b',
                    views: {
                        "details@abstractList": {
                            templateUrl: 'views/details-b.html'
                        }
                    }
                });

            // Configure all valid transitions
            TemplatePrefetchProvider.from('main').to('flow', {i: '1'}).to('list');
            TemplatePrefetchProvider.from('flow', {i: '1'}).to('flow', {i: '2'});
            TemplatePrefetchProvider.from('flow', {i: '2'}).to('flow', {i: '3'});
            TemplatePrefetchProvider.from('flow', {i: '3'}).to('main');
            TemplatePrefetchProvider.from('list').to('list.detailsA').to('list.detailsB');
            TemplatePrefetchProvider.from('list.detailsA').to('list.detailsB');
            TemplatePrefetchProvider.from('list.detailsB').to('list.detailsA');
        })
})(angular);