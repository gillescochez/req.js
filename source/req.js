// start req object, do not overwrite as would reset currently loaded req management
req = req || (function() {

	// private
	var 
		
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
			for (; i < len; i++) fn.apply(null, fn);
		},
		
		// load a resource and execute a callback when it is loaded
		load = function() {
		
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
	return function(resources, fn) {
		process(resources, fn);
	};
});