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



Load files

multiple files can be common to different call

on every file load iterate through a list of requests for every requests
check if the resources are loaded, if they are run the callback and remove the requests

*/
// start req object, do not overwrite as would reset currently loaded req management
var req = window.req || (function(doc) {

	// private
	var 
		
		// callback to execute in order
		executeStack = [],
		
		// track loaded and loading resources
		loaded = {},
		loading = {},
		
		// store objects created from module resources (externals are just loaded in the page)
		objects = {},
		
		// store instance of object initialized
		instances = {},
		
		// helper function to iterate over arrays
		each = function(arr, fn) {
			var len = arr.length, i = 0;
			for (; i < len; i++) fn.apply(null, [arr[i]]);
		},
		
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
			var arr = [];
			each(resources, function(resource) {
				if (!loaded[resource] && !loading[resource]) {
					if (resource.substr(0, 4) === 'http') arr.push(resource);
					else arr.push('./' + resource + '.js');
				};
			});
			return arr;
		},
		
		// convert modules to an array of object to use to execute the final callback
		modulesToArgs = function(resources) {
			var arr = [];
			each(resources, function(resource) {
				if (resource.substr(0, 4) !== 'http') {
					if (!instances[resource]) instances[resource] = new (objects[resource] || function(){});
					arr.push(instances[resource]);
				};
			});
			return arr;
		},
		
		execute = (function() {
		
			var current = null,
				run = function() {
				
				};
		
			return function(resources, callback) {
			console.log(executeStack);
				each(executeStack, function(data) {
					
				});
			};
		})(),
		
		// check for request ready to mark as done and call the execute function if so
		check = function(resources, callback) {

			var good = true;
			
			each(resources, function(resource) {
				if (loaded[resource] !== true) good = false;
			});
			
			if (good) {
				executeStack.push({
					resources: resources,
					callback: callback
				});
				execute();
			}
		};
	
	
	// public
	return function(resources, callback) {
	
		var files = modulesToFiles(resources);
		
		if (files.length) {
			each(files, function(resource) {
				loading[resource] = true;
				load(resource, function() {
					loaded[resource] = true;
					loading[resource] = false;
					check(files, callback);
				});
			});
		}
		else check(files, callback);
	};

})(document);

/* public testing */
req(['dummy'], function() {
	console.log(dummy);
	dummy = false;
});
req(['dummy'], function() {
	console.log(dummy);
});













