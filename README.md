[![Build status][travis-image]][travis-url]
[![Code climate][codeclimate-image]][codeclimate-url]
[![Test coverage][testcoverage-image]][testcoverage-url]

Template Prefetch
===========

A provider based on ui.router which prefetches all templates required by potentially following steps.

## Install

```shell
bower install --save ui-router-template-prefetch
```

## Documentation

In order to use template prefetching you have to define the routes your application state may go. This means you 
define which state can following after which using simple from().to() calls on the TemplatePrefetchProvider. Those
functions expect ui-router state names as you would use them in $state.go() calls.

```js
angular('myApp', ['template-prefetch'])
    .config(function (TemplatePrefetchProvider) {
        TemplatePrefetchProvider.from('start').to('overview').to('settings');
        TemplatePrefetchProvider.from('overview').to('details');
});
```
As you can see, a multiple to() calls can be chained on a from() call. For API clarity it is not possible to chain
a from() call to an to() call.

This is all you have to to. From now on ui-router-template-prefetch will fetch all templates and ng-includes for
all to-states of a given from-state.

[travis-image]: https://travis-ci.org/feigi/TemplatePrefetch.svg?branch=master
[travis-url]: https://travis-ci.org/feigi/TemplatePrefetch
[codeclimate-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/feigi/TemplatePrefetch
[testcoverage-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/coverage.svg
[testcoverage-url]: https://codeclimate.com/github/feigi/TemplatePrefetch