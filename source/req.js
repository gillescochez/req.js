/*
	Usage
	
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
			ordered: false
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
	
	Chainability (really minimalist chainability)
	
		// change path
		req('path','./')
		
		// declare a module
		('core', {
			init:function(){
			
			}
		)
		
		// load the declared module just for irony sake
		(['core','module'], function(core,mod) {
			core.init(); 
		});

*/
// start req object, do not overwrite as would reset currently loaded req management
var req = window.req || (function(doc) {

	// private
	var 
	
		// settings
		settings = {
			path: './modules/', // root path to the modules location
			ordered: true // set to false to disable the ordered execution of callback set for the same requests
		},
		
		// callback to execute in order
		stack = {},
		
		// track loaded and loading resources
		loaded = {},
		loading = {},
		
		// store objects created from module declaration
		objects = {},
		
		// settings setter
		config = function(name, value) {
			if (!settings[name]) throw name + ' is not a configuration parameter';
			if (value) settings[name] = value;
			else return settings[name];
		},
		
		// helper function to iterate over arrays
		each = function(arr, fn, key) {
			var len = arr.length, i = 0;
			for (; i < len; i++) fn.apply(null, key ? [i, arr[i]] : [arr[i]]);
		},
		
		// strict type checker to simplify function overloading
		is = (function(arr, obj) {
			
			each(arr, function(type) {
				(function(type) {
					obj[type] = function(it) {
						return it.constructor === window[type];
					};
				})(type);
			});
			
			return obj;
			
		})(['Array','String','Object','Function'], {}),
		
		// load a resource and execute a callback when it is loaded 
		// inspired from http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
		load = function(url, callback){

			var script = doc.createElement('script');

			if (script.readyState) {  //IE
				script.onreadystatechange = function() {
					if (/loaded|complete/.test(script.readyState)) {
						script.onreadystatechange = null;
						callback();
					};
				};
			}
			else script.onload = callback;

			script.src = url;
			doc.getElementsByTagName('head')[0].appendChild(script);
		},
		
		// convert resources array into a hash string (used by the stack)
		getHash = function(resources) {
			return resources.join('');
		},
		
		// convert an array of resources into URLs pointing to the resource file
		convert = function(resources) {
			var arr = [];
			each(resources, function(resource) {
				if (resource.substr(0, 4) === 'http') arr.push(resource);
				else arr.push(settings.path + resource + '.js');
			});
			return arr;
		},
		
		// create a argument array made out of module required in the resources request
		args = function(resources) {
			var arr = [];
			each(resources, function(resource) {
				if (resource.substr(0, 4) !== 'http') arr.push(objects[resource]);
			});
			return arr;
		},
		
		// execute a stack of callback for a given request
		execute = function(hash) {

			each(stack[hash].callbacks, function(i, callback) {
				if (!stack[hash][i - 1] && callback) {
					callback.apply(this, args(stack[hash].resources));
					stack[hash].callbacks.splice(i, 1);
					execute(hash);
				};
			}, true);
		},
		
		// executed when a resource load it check for loading state of resources requests
		done = function(resources) {

			var good = true;
	
			each(convert(resources), function(resource) {
				if (loaded[resource] !== true) good = false;
			});
			
			if (good) execute(getHash(resources));
		},
		
		// process a resources request by loading them up
		process = function(unloaded, resources) {
			each(unloaded, function(resource) {
				loading[resource] = true;
				load(resource, function() {
					loaded[resource] = true;
					loading[resource] = false;
					done(resources);
				});
			});
		},
		
		// handle a new resources request
		request = function(resources, callback) {
		
			var unloaded, hash;
			
			// convert resources request into a list of unloaded files and build hash
			unloaded = convert(resources);
			hash = getHash(resources);
			
			// add the callback to the stack
			if (!stack[hash]) {
				stack[hash] = {
					callbacks: [],
					resources: resources
				};
			};
			stack[hash].callbacks.push(callback);
			
			// either process to loading resources or to done directly if no resources need loading
			if (unloaded.length) process(unloaded, resources);
			else done(resources);
		},
		
		declare = function(name, object) {
			if (!objects[name]) objects[name] = object;
			else throw name + ' already exists!';
			console.log(objects);
		};
	
	// public
	return function() {
	
		// 0 argument :(
		if (arguments.length === 0) {
			return {
				settings: settings,
				objects: objects
			};
		};
		
		// 1 argument :|
		if (arguments.length === 1) {
		
			// return an object (object must be loaded) var mod = req('module');
			if (is.String(arguments[0])) {
				if (objects[arguments[0]]) return objects[arguments[0]];
				else throw arguments[0] + ' does not exists!';
			};
			
			if (is.Object(arguments[0])) {
				for (var name in arguments[0]) config(name, arguments[0][name]);
			};
		};
		
		// 2 arguments :)
		if (arguments.length === 2) {
		
			// request req([], function(){});
			if (is.Array(arguments[0]) && is.Function(arguments[1])) request(arguments[0], arguments[1]);
			
			// declaring a module req('module', {} || function(){});
			if (is.String(arguments[0]) && (is.Object(arguments[1]) || is.Function(arguments[1]))) {
				declare(arguments[0], arguments[1]);
			};

			// global setting set req('path', './modules/'); and get req('get','path');
			if (is.String(arguments[0]) && is.String(arguments[1])) {
				if (arguments[0] === 'get') return config(arguments[1]);
				else config(arguments[0], arguments[1]);
			};
		};
		
		// chainability
		return req;
	};

})(document);

/* public testing */

// first callback
req(['dummy'], function() {
	console.log(dummy);
	dummy = false;
	
// second callback
})(['dummy'], function() {
	console.log(dummy);
	
// change the modules path
});

req('dummy', {
	foo: 'foo'
});

// in 5 second do the same request but we change the path just before so it will load another dummy.js
// which will overwrite the dummy = false of the first callback (as executed in order they were written)
setTimeout(function() {
	req('path','')(['dummy'], function() {
		console.log(dummy);
		console.log(req('dummy'));
		console.log(req());
		console.log(req().settings);
		console.log(req().objects);
	})
}, 5000);













