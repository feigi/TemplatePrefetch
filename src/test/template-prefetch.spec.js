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
            expect(testee.getRoutesFor('from')).toEqual([{name: 'to'}]);
        });

        it('from function returns object with to function', function () {
            expect(testee.from().to).toBeDefined();
        });

        it('to function returns object with to function thus enabling chaining', function () {
            expect(testee.from().to().to).toBeDefined();
        });

        it('object returned by from function does not contain from function', function () {
            expect(testee.from().from).toBeUndefined();
        });

        it('one from multiple to', function () {
            testee.from('from')
                .to('to1')
                .to('to2');

            expect(testee.getRoutesFor('from')).toEqual([{name: 'to1'}, {name: 'to2'}]);
        });

        it('multiple from multiple to', function () {
            testee.from('from')
                .to('to1')
                .to('to2');
            testee.from('from2')
                .to('to3')
                .to('to4');

            expect(testee.getRoutesFor('from')).toEqual([{name: 'to1'}, {name: 'to2'}]);
            expect(testee.getRoutesFor('from2')).toEqual([{name: 'to3'}, {name: 'to4'}]);
        });

        it('from function should accept object with name and stateParams property', function () {
            testee.from('from', {i: 1}).to('to1');
            testee.from('from', {i: 2}).to('to2');

            expect(testee.getRoutesFor('from', {i: 1})).toEqual([{name: 'to1'}]);
            expect(testee.getRoutesFor('from', {i: 2})).toEqual([{name: 'to2'}]);
        });

        it('from function should accept two parameters, the state name and stateParams object', function () {
            testee.from({name: 'from', stateParams: {i: 1}}).to('to1');
            testee.from({name: 'from', stateParams: {i: 2}}).to('to2');

            expect(testee.getRoutesFor('from', {i: 1})).toEqual([{name: 'to1'}]);
            expect(testee.getRoutesFor('from', {i: 2})).toEqual([{name: 'to2'}]);
        });

        it('to function should accept object with name and stateParams property', function () {
            testee.from('from')
                .to({name: 'to1', stateParams: {i: 0}})
                .to('to2');

            expect(testee.getRoutesFor('from')).toEqual([
                {name: 'to1', stateParams: {i: 0}},
                {name: 'to2'}
            ]);
        });

        it('to function should accept two parameters, the state name and stateParams object', function () {
            testee.from('from')
                .to('to1', {i: 0})
                .to('to2');

            expect(testee.getRoutesFor('from')).toEqual([
                {name: 'to1', stateParams: {i: 0}},
                {name: 'to2'}
            ]);
        });

        it('registering the same to state twice should not be possible', function () {
            testee.from('from')
                .to('to1', {i: 0})
                .to('to1', {i: 0});

            expect(testee.getRoutesFor('from')).toEqual([
                {name: 'to1', stateParams: {i: 0}}
            ]);
        });
    });

    describe('Template Prefetching', function () {

        var currentStateMock = {};
        var statesMap = {};

        var INCLUDE_HTML = '<div ng-include="\'test-include1.html\'"></div><div><div><div><div ' +
            'ng-include="\'test-include2.html\'"></div></div></div></div>';
        var INCLUDE2_HTML = '<div ng-include="\'test-include3.html\'"></div>';
        var INCLUDE3_HTML = '<div ng-include="\'test-include4.html\'"></div>';
        var MOCK_HTML = 'MOCK_HTML';

        var rootScopeMock, stateMock, stateParamsMock, templateCacheMock, templateCacheMockMap, httpMock;

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

            stateParamsMock = {};

            var templateForUrl = function (url, resolveFunc) {
                if (url === 'test-include.html') {
                    resolveFunc(INCLUDE_HTML);
                } else if (url === 'test-include2.html') {
                    resolveFunc(INCLUDE2_HTML);
                } else if (url === 'test-include3.html') {
                    resolveFunc(INCLUDE3_HTML);
                } else {
                    resolveFunc(MOCK_HTML);
                }
            };

            templateCacheMockMap = {};

            templateCacheMock = {
                put: jasmine.createSpy('templateCache.put'),
                get: jasmine.createSpy('templateCache.get').and.callFake(function (url) {
                    return templateCacheMockMap[url];
                })
            };

            httpMock = {
                get: jasmine.createSpy('http.get').and.callFake(function (url) {
                    return {
                        success: function (resolveFunc) {
                            templateForUrl(url, resolveFunc);
                        }
                    }
                })
            }
        };

        beforeEach(function () {

            // Initialize test-template-prefetch injector
            module('template-prefetch', 'test-template-prefetch');

            initMocks();

            // Initialize test-template-prefetch injector
            module(function ($provide) {
                $provide.value("$state", stateMock);
                $provide.value("$stateParams", stateParamsMock);
                $provide.value("$templateCache", templateCacheMock);
                $provide.value("$http", httpMock);
                $provide.value("$rootScope", rootScopeMock);
            });

            //inject();
        });

        var initTestModule = function (initFunc) {
            angular.module('test-template-prefetch', [])
                .config(function (TemplatePrefetchProvider) {
                    initFunc(TemplatePrefetchProvider);
                }
            );
            inject();
        };

        it('test setup', function () {
            expect(rootScopeMock).toBeDefined();
            expect(stateMock).toBeDefined();
            expect(templateCacheMock).toBeDefined();
            expect(httpMock).toBeDefined();
        });

        // Injecting the service calls its $get method, thus initializes it
        it('On Initialize: Service registers event listener for $stateChangeSuccess', inject(function (TemplatePrefetch) {
            expect(rootScopeMock.$on).toHaveBeenCalledWith('$stateChangeSuccess', jasmine.any(Function));
        }));

        it('On Initialize: Service runs a prefetch for the current state.', function () {
            statesMap['state2'] = {templateUrl: 'test-template.html'};
            currentStateMock.name = "state1";

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template.html', MOCK_HTML);
        });

        it('On state change: Service runs a prefetch for the upcoming state', function () {
            var MOCK_EVENT = {};
            currentStateMock.name = "state1";
            statesMap['state2'] = {templateUrl: 'test-template.html'};
            statesMap['state3'] = {templateUrl: 'test-template2.html'};

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2').to('state3');
            });

            onStateChangeSuccessCallback(MOCK_EVENT, {name: 'state2'});

            expect(httpMock.get).toHaveBeenCalledWith('test-template2.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template2.html', MOCK_HTML);
        });

        it('Service should load templates from views if templateUrl is undefined', function () {
            currentStateMock.name = "state1";
            statesMap['state2'] = {
                views: {
                    'view1': {templateUrl: 'test-template1.html'},
                    'view2': {templateUrl: 'test-template2.html'}
                }
            };

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template1.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-template2.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template1.html', MOCK_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template2.html', MOCK_HTML);
        });

        it('Service should load templates from ng-includes (recursively)', function () {
            currentStateMock.name = "state1";
            statesMap['state2'] = {templateUrl: 'test-include.html'};

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-include.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include1.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include2.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include3.html');
            expect(httpMock.get).toHaveBeenCalledWith('test-include4.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include.html', INCLUDE_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include1.html', MOCK_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include2.html', INCLUDE2_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include3.html', INCLUDE3_HTML);
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-include4.html', MOCK_HTML);
        });

        it('Service should resolve templateUrl functions', function () {
            currentStateMock.name = "state1";
            statesMap['state2'] = {
                templateUrl: function () {
                    return 'test-template.html'
                }
            };

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template.html', MOCK_HTML);
        });

        it('Service should resolve templateUrl functions', function () {
            currentStateMock.name = "state1";
            statesMap['state2'] = {
                templateUrl: function () {
                    return 'test-template.html'
                }
            };

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template.html', MOCK_HTML);
        });

        it('templateUrl functions should get stateParams as argument', function () {
            currentStateMock.name = "state1";
            statesMap['state2'] = {
                templateUrl: function ($stateParams) {
                    expect($stateParams).toBeDefined();
                }
            };

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });
        });

        it('templateUrl functions should get stateParams with values predefined in template prefetch config', function () {
            var MOCK_PARAM = 'MOCK_PARAM';
            stateParamsMock.param1 = MOCK_PARAM;
            stateParamsMock.param2 = MOCK_PARAM;
            stateParamsMock.i = 1;
            var EXPECTED_STATE_PARAMS = {
                param1: MOCK_PARAM,
                param2: MOCK_PARAM,
                i: 2
            };
            currentStateMock.name = "state1";
            statesMap['state2'] = {
                templateUrl: function ($stateParams) {
                    expect($stateParams).toEqual(EXPECTED_STATE_PARAMS);
                }
            };

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2', {i: 2});
            });
        });

        it('from state should honor stateParams as well and choose the appropriate node', function () {
            currentStateMock.name = "state1";
            stateParamsMock.i = '1';
            statesMap['state2'] = {templateUrl: 'test-template1.html'};
            statesMap['state3'] = {templateUrl: 'test-template2.html'};

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
                TemplatePrefetchProvider.from('state1', {i: '1'}).to('state3');
            });

            expect(httpMock.get).toHaveBeenCalledWith('test-template2.html');
            expect(templateCacheMock.put).toHaveBeenCalledWith('test-template2.html', MOCK_HTML);
        });

        it('no http.get should be done if the templateCache already contains the template', function () {
            statesMap['state2'] = {templateUrl: 'test-template.html'};
            currentStateMock.name = "state1";
            templateCacheMockMap["test-template.html"] = MOCK_HTML;

            // Init and config the test module
            initTestModule(function (TemplatePrefetchProvider) {
                TemplatePrefetchProvider.from('state1').to('state2');
            });

            expect(templateCacheMock.get).toHaveBeenCalledWith("test-template.html");
            expect(httpMock.get).not.toHaveBeenCalled();
            expect(templateCacheMock.put).not.toHaveBeenCalled();
        })
    });
});