(function (angular) {

    'use strict';

    var Node = function (fromState, toState) {
        this.from = fromState;
        this.to = [];

        if (toState) {
            this.to.push(toState);
        }
    };

    angular.module('template-prefetch', ['ui.router'])
        .provider('TemplatePrefetch', [function () {

            var routeMap = {};

            var from = function (fromState) {
                var node = routeMap[fromState] || new Node(fromState);
                return {
                    to: to(node)
                };
            };

            var to = function (node) {
                return function (toState) {
                    node.to.push(toState);
                    if (!routeMap[node.from]) {
                        routeMap[node.from] = node;
                    }
                    return {
                        to: to(node),
                        from: from
                    };
                };
            };

            this.$get = ['$rootScope', '$state', '$templateCache', '$http', function ($rootScope, $state, $templateCache, $http) {

                var prefetch = function (toState) {
                    var node = routeMap[toState];
                    if (!node) {
                        return;
                    }

                    for (var i = 0; i < node.to.length; i++) {

                        var toStateName = node.to[i];
                        var toStateObj = $state.get(toStateName);
                        var url;

                        if (!toStateObj.templateUrl && toStateObj.views) {
                            for (var viewName in toStateObj.views) {
                                var view = toStateObj.views[viewName];
                                if (view.templateUrl) {
                                    url = view.templateUrl;
                                    $http.get(url).success(handleResponse(url));
                                }
                            }
                        } else {
                            url = toStateObj.templateUrl;
                            $http.get(url).success(handleResponse(url));
                        }
                    }
                };

                function fetchIncludes(data) {
                    var pattern = /ng-include=('"|"')(.+?)('"|"')/g;
                    var match;
                    while (match = pattern.exec(data)) {
                        // Second capture group of regex;
                        var url = match[2];
                        $http.get(url).success(handleResponse(url));
                    }
                }

                var handleResponse = function (url) {
                    return function (data) {
                        fetchIncludes(data);
                        $templateCache.put(url, data);
                    };
                };

                prefetch($state.current.name);

                $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                    prefetch(toState.name);
                });

                return {};
            }];

            this.from = from;

            this.getRoutesFor = function (fromState) {
                return routeMap[fromState].to;
            }
        }]);
}(angular));