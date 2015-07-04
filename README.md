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
angular('myApp', ['template-prefetch']).config(function (TemplatePrefetchProvider) {
    TemplatePrefetchProvider.from('start').to('overview').to('settings');
    TemplatePrefetchProvider.from('overview').to('details');
});
```
As you can see, a multiple to() calls can be chained on a from() call. For API clarity it is not possible to chain
a from() call to an to() call.

This is all you have to to. From now on ui-router-template-prefetch will fetch all templates and ng-includes for
all to-states of a given from-state.

## License

The MIT License

Copyright (c) 2010-2015 Google, Inc. http://angularjs.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[travis-image]: https://travis-ci.org/feigi/TemplatePrefetch.svg?branch=master
[travis-url]: https://travis-ci.org/feigi/TemplatePrefetch
[codeclimate-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/feigi/TemplatePrefetch
[testcoverage-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/coverage.svg
[testcoverage-url]: https://codeclimate.com/github/feigi/TemplatePrefetch