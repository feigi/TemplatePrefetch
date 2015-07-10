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
                return function (toState, stateParams) {
                    var toStateObj = toState;
                    if (typeof toState === 'string') {
                        toStateObj = {name: toState};
                        if (stateParams) {
                            toStateObj.stateParams = stateParams;
                        }
                    }
                    node.to.push(toStateObj);
                    if (!routeMap[node.from]) {
                        routeMap[node.from] = node;
                    }
                    return {
                        to: to(node),
                        from: from
                    };
                };
            };

            this.$get = ['$rootScope', '$state', '$stateParams', '$templateCache', '$http', '$log',
                function ($rootScope, $state, $stateParams, $templateCache, $http, $log) {

                    $log.debug('TemplatePrefetch: Instantiated');

                    var prefetch = function (toState) {

                        $log.debug('TemplatePrefetch: called with toState: ' + toState);

                        var node = routeMap[toState];
                        if (!node) {
                            return;
                        }

                        for (var i = 0; i < node.to.length; i++) {

                            var toStateNode = node.to[i];
                            var toStateName = toStateNode.name;
                            var toStateObj = $state.get(toStateName);
                            var url;

                            if (!toStateObj.templateUrl && toStateObj.views) {
                                $log.debug('TemplatePrefetch: No templateUrl for ' + toStateName + ', checking views...');
                                for (var viewName in toStateObj.views) {
                                    var view = toStateObj.views[viewName];
                                    if (view.templateUrl) {
                                        url = getTemplateUrl(view, toStateNode.stateParams);
                                        $log.debug('TemplatePrefetch: Fetching view template ' + url);
                                        $http.get(url).success(handleResponse(url));
                                    }
                                }
                            } else {
                                url = getTemplateUrl(toStateObj, toStateNode.stateParams);
                                $log.debug('TemplatePrefetch: Fetching template ' + url);
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

                    var getTemplateUrl = function (stateOrView, stateParams) {
                        var templateUrl = stateOrView.templateUrl;
                        if (typeof templateUrl === 'function') {
                            var copiedStateParams = angular.copy($stateParams);

                            /* If the toState comes with stateParams we copy them over to
                             * the injected stateParams, so the templateUrl function gets
                             * the predefined and current stateParams. */
                            if (stateParams) {
                                for (var param in stateParams) {
                                    copiedStateParams[param] = stateParams[param];
                                }
                            }
                            return templateUrl(copiedStateParams);
                        }
                        return templateUrl;
                    };

                    prefetch($state.current.name);

                    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                        prefetch(toState.name);
                    });

                    // Sorry no API :)
                    return {};
                }];

            this.from = from;

            this.getRoutesFor = function (fromState) {
                return routeMap[fromState].to;
            };
        }]);
}(angular));