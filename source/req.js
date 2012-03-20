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
	
	Chainability (really minimalist chainability)
	
		req('path','http://')
		('core', {
			init:function(){
			
			}
		)
		(['core','module'], function(core,mod) {
			core.init(); 
		});

*/
// start req object, do not overwrite as would reset currently loaded req management
var req = window.req || (function(doc) {

	// private
	var 
		
		// callback to execute in order
		executeStack = {},
		
		// track loaded and loading resources
		loaded = {},
		loading = {},
		
		// store objects created from module resources (externals are just loaded in the page)
		objects = {},
		
		// store instance of object initialized
		instances = {},
		
		// helper function to iterate over arrays
		each = function(arr, fn, key) {
			var len = arr.length, i = 0;
			for (; i < len; i++) fn.apply(null, ( key ? [i, arr[i]] : [arr[i]] ) );
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
		
		// convert resources array into a hash string (used by the executeStack)
		getHash = function(resources) {
			return resources.join('');
		},
		
		// convert an array of resources into URLs pointing to the resource file
		convert = function(resources) {
			var arr = [];
			each(resources, function(resource) {
				if (!loaded[resource] && !loading[resource]) {
					if (resource.substr(0, 4) === 'http') arr.push(resource);
					else arr.push('./' + resource + '.js');
				};
			});
			return arr;
		},
		
		// create a argument array made out of module loaded
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
		
		// execute a stack of callback
		execute = function(hash) {
			each(executeStack[hash], function(i, callback) {
				if (!executeStack[hash][i - 1] && callback) {
					callback();
					executeStack[hash].splice(i, 1);
					execute(hash);
				};
			}, true);
		},
		
		// check for request ready to mark as done and call the execute function if so
		check = function(resources) {

			var good = true,
				hash = getHash(resources);
			
			each(resources, function(resource) {
				if (loaded[resource] !== true) good = false;
			});
			
			if (good) execute(hash);
		};
	
	// public
	return function(resources, callback) {
	
		var hash;
		
		resources = convert(resources);
		hash = getHash(resources);
		
		if (!executeStack[hash]) executeStack[hash] = [];
		executeStack[hash].push(callback);
		
		if (resources.length) {
			each(resources, function(resource) {
				loading[resource] = true;
				load(resource, function() {
					loaded[resource] = true;
					loading[resource] = false;
					check(resources);
				});
			});
		}
		else check(resources);
		
		// chainability
		return req;
	};

})(document);

/* public testing */
req(['dummy'], function() {
	console.log(dummy);
	dummy = false;
})(['dummy'], function() {
	console.log(dummy);
});













