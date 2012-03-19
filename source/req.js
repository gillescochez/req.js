/*
	Usage
	
		// load modules
		req(['user','panel'], function(user, panel) {
		
		});
		
		// load modules and an external file in the global scope
		req(['user','http://domain.com/data.js','panel'], function(user, panel) {
		
		});
		
		// change a configuration value
		req('path','http://resources.domain.com/js/');
		
		// declare a module
		req('dummy, {
			foo: function() {
				console.log('foo');
			}
		});

*/

// start req object, do not overwrite as would reset currently loaded req management
var req = window.req || (function(doc) {

	// private
	var 
	
		// settings
		settings = {
			path: './js'
		},
		
		// store loaded resources
		loaded = [],
		
		// store resources currently loading
		loading = [],
		
		// store objects created from module resources (externals are just loaded in the page)
		objects = {},
		
		// store instance of object initialized
		instances = {},
		
		// helper function to interate over arrays
		each = function(arr, fn) {
			var len = arr.length, i = 0;
			for (; i < len; i++) fn.apply(null, [i, arr[i], arr]);
		},
		
		// type helper functions (dynamically created to simplify supporting more types)
		is = (function(types, object) {
		
			each(types, function(k, v) {
				(function(v) {
					object[v.toLowerCase()] = function(it) {
						return it.constructor == window[v];
					};
				})(v);
			});
			
			return object;
			
		})(['String', 'Array'], {}),
		
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
		
		// convert an array of resources into URLs pointing to the resource file
		modulesToFiles = function(resources) {
		
		},
		
		// process a new request for resources
		process = function(resources, fn) {
		
		},
		
		// execute the callback for a given request of resources
		execute = function(resources) {
		
		};
	
	
	// public
	return function() {
		if (typeof arguments[0] === 'string') {
			if (typeof arguments[1] === 'string') settings[arguments[0]] = arguments[1];
			else return settings[arguments[0]];
		}
		else process.apply(this, arguments);
	};
})(document);

/* public testing */
req('path','foo');
console.log(req('path'));













