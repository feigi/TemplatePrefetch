/**
 * Created by zieglerc on 25/06/15.
 */
describe('Template Prefetch Module', function () {


    describe('Template Prefetch Provider Config', function () {

        var testee;

        beforeEach(function () {

            // Initialize the service provider
            // by injecting it to a fake module's config block
            angular.module('test-template-prefetch', [])
                .config(function (TemplatePrefetchProvider) {
                    testee = TemplatePrefetchProvider;
                });

            // Initialize test-template-prefetch injector
            module('template-prefetch', 'test-template-prefetch');

            // Kickstart the injectors previously registered
            // with calls to angular.mock.module
            inject();
        });

        it('test setup', function () {
            expect(testee).toBeDefined();
            expect(testee.from).toBeDefined();
            expect(testee.getRoutesFor).toBeDefined();
        });

        it('one from one to', function () {
            testee.from('from').to('to');
            expect(testee.getRoutesFor('from')).toEqual(['to']);
        });

        it('from function returns object with to function', function () {
            expect(testee.from().to).toBeDefined();
        });

        it('to function returns object with to function thus enabling chaining', function () {
            expect(testee.from().to().to).toBeDefined();
        });

        it('to function returns object with to function thus enabling chaining', function () {
            expect(testee.from().from).toBeUndefined();
        });

        it('one from multiple to', function () {
            testee.from('from')
                .to('to1')
                .to('to2');

            expect(testee.getRoutesFor('from')).toEqual(['to1', 'to2']);
        });

        it('multiple from multiple to', function () {
            testee.from('from')
                .to('to1')
                .to('to2');
            testee.from('from2')
                .to('to3')
                .to('to4');

            expect(testee.getRoutesFor('from')).toEqual(['to1', 'to2']);
            expect(testee.getRoutesFor('from2')).toEqual(['to3', 'to4']);
        });

    });

    describe('Template Prefetching', function () {

        var currentStateMock = {};
        var statesMap = {};

        var INCLUDE_HTML = '<div ng-include="\'test-include1.html\'"></div><div><div><div><div ' +
            'ng-include="\'test-include2.html\'"></div></div></div></div>';
        var MOCK_HTML = 'MOCK_HTML';

        var rootScopeMock, stateMock, templateCacheMock, httpMock, TemplatePrefetchProvider;

        var onStateChangeSuccessCallback = null;

        var initMocks = function () {

            rootScopeMock = {
                $on: jasmine.createSpy('rootScope.on').and.callFake(function (event, callback) {
                    if (event === '$stateChangeSuccess') {
                        onStateChangeSuccessCallback = callback;
                    }
                })
            };

            stateMock = {
                get: function (toState) {
                    return statesMap[toState];
                },
                current: currentStateMock
            };

            templateCacheMock = {
                put: jasmine.createSpy('templateCache.put')
            };

            httpMock = {
                get: jasmine.createSpy('http.get').and.callFake(function (url) {
                    return {
                        success: function (resolveFunc) {
                            // Immediately resolve promise
                            if (url === 'test-template.html') {
                                resolveFunc(INCLUDE_HTML);
                            } else {
                                resolveFunc(MOCK_HTML);
                            }
                        }
                    }
                })
            }
        };

        beforeEach(function () {

            // Initialize the service provider
            // by injecting it to a fake module's config block
            angular.module('test-template-prefetch', [])
                .config(function (_TemplatePrefetchProvider_) {
                    TemplatePrefetchProvider = _TemplatePrefetchProvider_;
                }
            );

            // Initialize test-template-prefetch injector
            module('template-prefetch', 'test-template-prefetch');

            initMocks();

            // Initialize test-template-prefetch injector
            module(function ($provide) {
                $provide.value("$state", stateMock);
                $provide.value("$templateCache", templateCacheMock);
                $provide.value("$http", httpMock);
                $provide.value("$rootScope", rootScopeMock);
            });

            inject();
        });

        it('test setup', function () {
            expect(rootScopeMock).toBeDefined();
            expect(stateMock).toBeDefined();
            expect(templateCacheMock).toBeDefined();
            expect(httpMock).toBeDefined();
            expect(TemplatePrefetchProvider).toBeDefined();
        });

        // Injecting the service calls its $get method, thus initializes it
        it('On Initialize: Service registers event listener for $stateChangeSuccess', inject(function (TemplatePrefetch) {
            expect(rootScopeMock.$on).toHaveBeenCalledWith('$stateChangeSuccess', jasmine.any(Function));
        }));

        var setupRoutes = function () {

            statesMap['state2'] = {templateUrl: 'test-template.html'};
            statesMap['state3'] = {
                views: {
                    'view1': {templateUrl: 'test-template2.html'},
                    'view2': {templateUrl: 'test-template3.html'}
                }
            };
            statesMap['state4'] = {templateUrl: function () {return 'test-template4.html'}};

            // Configure routes
            TemplatePrefetchProvider.from('state1').to('state2').to('state3');
            TemplatePrefetchProvider.from('state2').to('state4');
        };

        it('On Initialize: Service prefetches and saves the templates for all states following the current one ' +
            'for state with templateUrl and includes', function () {
            setupRoutes();
            currentStateMock.name = "state1";
            // Trigger init of TemplatePrefetch
            inject(function (TemplatePrefetch) {
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-template2.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-template3.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include1.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include2.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template.html', INCLUDE_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template2.html', MOCK_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template3.html', MOCK_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include1.html', MOCK_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include2.html', MOCK_HTML);
        });

        it('On state change: Service prefetches and saves the templates for all states following the current one', function () {
            var MOCK_EVENT = {};
            setupRoutes();
            currentStateMock.name = "state1";
            // Trigger init of TemplatePrefetch
            inject(function (TemplatePrefetch) {
            });

            onStateChangeSuccessCallback(MOCK_EVENT, {name: 'state2'});

            expect(httpMock.get).toHaveBeenCalledWith('test-template4.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template4.html', MOCK_HTML)
        });
    });
});