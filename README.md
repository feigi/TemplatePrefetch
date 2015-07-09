[![Build status][travis-image]][travis-url]
[![Code climate][codeclimate-image]][codeclimate-url]
[![Test coverage][testcoverage-image]][testcoverage-url]

Template Prefetch
===========

A provider based on ui.router which prefetches all templates required by potentially following states.

## Motivation

Using UI-Router you are encouraged to divide your application markup in small junks. This can result in quite a view 
 files making up a single page. Those files obviously have to be fetched from the server which can lead to flickering
 during the rendering process. Of course you can help yourself by prefilling the template cache, but this usually means
 loading a single javascript file containing the markup for your whole application. In other words have to load markup
 you may not even need. This can cause rather long loading times which is definitely not what you want, especially on 
 mobile devices. 
 Wouldn't it be cool to just load the markup you will need for the pages a user can view next? ui-router-template-prefetch
 lets you achieve this.
 By defining which state B can follow a state A, ui-router-template-prefetch is able to load all markup that is needed
 to render state B while the user is still in state A. If state B is activated the markup is already there and the
 rendering will be smooth and quick.

## Install

```shell
bower install --save ui-router-template-prefetch
```

## Documentation

In order to use template prefetching you have to define valid routes for your application state. This means you provide
 all the state transitions that are valid for your application. This is done by simple from('A').to('B') calls, where
 A and B are valid ui.router state names.
 So, essentially, ui-router-template-prefetch has a complete state model of your application. In graph theoretical terms, 
 the states from ui.router are the nodes and the from().to() calls represent the directed edges between nodes.
 The state transitions are defined as follows:

```js
angular('myApp', ['template-prefetch'])
    .config(function (TemplatePrefetchProvider) {
        TemplatePrefetchProvider.from('start').to('overview').to('settings');
        TemplatePrefetchProvider.from('overview').to('details');
});
```
As you can see, multiple to() calls can be chained to a from() call. For API clarity it is not possible to chain
 a from() call to an to() call.

This is all you have to to. From now on ui-router-template-prefetch will fetch all templates and ng-includes for
 all to-states of a given from-state.

[travis-image]: https://travis-ci.org/feigi/TemplatePrefetch.svg?branch=master
[travis-url]: https://travis-ci.org/feigi/TemplatePrefetch
[codeclimate-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/feigi/TemplatePrefetch
[testcoverage-image]: https://codeclimate.com/github/feigi/TemplatePrefetch/badges/coverage.svg
[testcoverage-url]: https://codeclimate.com/github/feigi/TemplatePrefetch