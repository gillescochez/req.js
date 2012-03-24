# Introduction

req.js is tiny script / module (sort of) management system which can:

- Load javascript files and execute callback when the requested files are loaded
- Execute callbacks in the order they were declared for multiple identical requests
- Store objects declared using req API and make them available as arguments in the callback function when requested
- Return its settings object and its module storage objects
- Set and get configuration parameter
- Can return a loaded/declared object from its storage

## Usage

```javascript

// load modules
req(['user','panel'], function(user, panel) {

});

// load modules in the callback scope and an external file in the global scope
req(['user','http://domain.com/data.js','panel'], function(user, panel) {

});

// set a configuration parameter
req('path','http://resources.domain.com/js/');

// set multiple configuration parameter
req({
	path: './',
	order: false
});

// get a configuration paramete
var p = req('get','path');

// get the settings object
var config = req().settings;

// declare a module
req('dummy', {
	foo: function() {
		console.log('foo');
	}
});

// request a module (the module must be loaded)
var mod = req('dummy');

// get an object containing all the modules
var list = req().objects;

// get an object of both settings and objects setting in one go (as you might have guess by now...)
var obj = req();

``` 

## Minimalistic chainability

```javascript

// change path
req('path','./')

// declare a module
('core', {
	init:function(){
	
	}
)

// load the declared module just for irony sake
(['core','module'], function(core, mod) {
	core.init();
	mod.load();
});
```