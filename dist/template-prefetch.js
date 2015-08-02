(function (angular) {

    'use strict';

    angular.module('template-prefetch', ['ui.router'])
        .provider('TemplatePrefetch', [function () {

            /**
             * An array of Edge objects representing the
             * routes configured by the user.
             */
            var routes = [];

            var createNode = function (stateName, queryParams) {
                var node = {name: stateName};
                if (queryParams && !angular.equals({}, queryParams)) {
                    node.stateParams = queryParams;
                }
                return node;
            };

            var createEdge = function (fromStateObj, toStateObj) {
                var toArray = [];
                if (toStateObj) {
                    toArray.push(toStateObj);
                }
                return {
                    from: fromStateObj,
                    to: toArray,
                    new: true
                }
            };

            var createStateObj = function (state, stateParams) {
                var stateObj = state;
                if (typeof state === 'string') {
                    stateObj = createNode(state, stateParams);
                }
                return stateObj;
            };

            /**
             * Iterates all Edge objects in 'routes' and compares their
             * 'from' value with the given 'fromNode' argument.
             * @param fromNode The value to compare the routes with
             * @returns An createEdge object with a 'from' property value
             * matching 'fromNode'
             */
            var findRouteWithFrom = function (fromNode) {
                for (var i = 0; i < routes.length; i++) {
                    var edge = routes[i];
                    if (angular.equals(edge.from, fromNode)) {
                        return edge;
                    }
                }
            };

            var findObjectInArray = function (object, array) {
                for (var i = 0; i < array.length; i++) {
                    var aNode = array[i];
                    if (angular.equals(aNode, object)) {
                        return aNode;
                    }
                }
            };

            /**
             *
             * @param fromState Either object or string, whereas the object
             * must have a property 'name' and an optional property 'stateParams'
             * @param stateParams An object containing all query
             * parameters to consider for the route
             * @returns {{to}}
             */
            var from = function (fromState, stateParams) {
                var fromStateObj = createStateObj(fromState, stateParams);
                var edge = findRouteWithFrom(fromStateObj) || createEdge(fromStateObj);
                return {
                    to: to(edge)
                };
            };

            var to = function (edge) {
                return function (toState, stateParams) {
                    var toStateObj = createStateObj(toState, stateParams);
                    if (!findObjectInArray(toStateObj, edge.to)) {
                        edge.to.push(toStateObj);
                    }
                    //var fromStateKey = createStateObjKey(edge.from.name, edge.from.stateParams);
                    if (edge.new) {
                        delete edge.new;
                        routes.push(edge);
                    }
                    return {
                        to: to(edge),
                        from: from
                    };
                };
            };


            this.$get = ['$rootScope', '$state', '$stateParams', '$templateCache', '$http', '$log',
                function ($rootScope, $state, $stateParams, $templateCache, $http, $log) {

                    $log.debug('TemplatePrefetch: Instantiated');

                    var prefetch = function (fromState, fromParams) {

                        $log.debug('TemplatePrefetch: Called with fromState ' + fromState + ', fromParams ' + JSON.stringify(fromParams));

                        var edge = findRouteWithFrom(createNode(fromState, fromParams));
                        if (!edge) {
                            $log.debug('No edge found for fromState ' + fromState);
                            return;
                        }

                        for (var i = 0; i < edge.to.length; i++) {

                            var toStateNode = edge.to[i];
                            var toStateName = toStateNode.name;
                            var toStateObj = $state.get(toStateName);
                            var url;

                            $log.debug('TemplatePrefetch: Determining templates for toState ' + toStateName + ', toParams: '
                                + JSON.stringify(toStateNode.stateParams));

                            if (!toStateObj.templateUrl && toStateObj.views) {
                                $log.debug('TemplatePrefetch: No templateUrl for state ' + toStateName + ', checking views...');
                                for (var viewName in toStateObj.views) {
                                    var view = toStateObj.views[viewName];
                                    if (view.templateUrl) {
                                        url = getTemplateUrl(view, fromParams, toStateNode.stateParams);
                                        fetchTemplate(url);
                                    }
                                }
                            } else {
                                url = getTemplateUrl(toStateObj, fromParams, toStateNode.stateParams);
                                fetchTemplate(url);
                            }
                        }
                    };

                    function fetchIncludes(data) {
                        var pattern = /ng-include=('"|"')(.+?)('"|"')/g;
                        var match;
                        while (match = pattern.exec(data)) {
                            // Second capture group of regex;
                            var url = match[2];
                            fetchTemplate(url);
                        }
                    }

                    var fetchTemplate = function (url) {
                        if (!$templateCache.get(url)) {
                            $log.debug('TemplatePrefetch: Fetching template - ' + url);
                            $http.get(url).success(handleResponse(url));
                        } else {
                            $log.debug('TemplatePrefetch: Template already cached - ' + url);
                        }
                    };

                    var handleResponse = function (url) {
                        return function (data) {
                            fetchIncludes(data);
                            $templateCache.put(url, data);
                        };
                    };

                    /**
                     *
                     * @param stateOrView The state or view whose template should be loaded
                     * @param currentParams The stateParams of the currently active state
                     * @param stateParams The stateParams configured with this state in case
                     *          templateUrl function is used.
                     * @returns {*}
                     */
                    var getTemplateUrl = function (stateOrView, currentParams, stateParams) {
                        var templateUrl = stateOrView.templateUrl;
                        if (typeof templateUrl === 'function') {
                            //var copiedStateParams = angular.copy(currentParams);

                            /* If the toState comes with stateParams we copy them over to
                             * the injected stateParams, so the templateUrl function gets
                             * the predefined plus the current stateParams. */
                            /*                            if (stateParams) {
                             for (var param in stateParams) {
                             if (stateParams.hasOwnProperty(param)) {
                             copiedStateParams[param] = stateParams[param];
                             }
                             }
                             }*/
                            return templateUrl(stateParams || {});
                        }
                        return templateUrl;
                    };

                    if ($state.current.name !== '') {
                        prefetch($state.current.name, $stateParams);

                    }

                    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                        prefetch(toState.name, toParams);
                    });

                    // Sorry no API :)
                    return {};
                }];

            // Provider API

            this.from = from;

            this.getRoutesFor = function (fromState, stateParams) {
                var fromStateObj = createStateObj(fromState, stateParams);
                var edge = findRouteWithFrom(fromStateObj);
                return edge ? edge.to : [];
            };
        }])
        .run(function (TemplatePrefetch) {
            // Just trigger instantiation of TemplatePrefetch
        });
}(angular));