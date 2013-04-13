/*! github.com/gillescochez/req.js */
var req = window.req || (function(doc) {

	'use strict';

	// private
    var 
		req,
		
		head = doc.getElementsByTagName('head')[0],
		
		global = {},
		
		// settings
        settings = {
            path: './modules/',
            order: true
        },
        
        // stack to process
        stack = {},
        
        // track loaded and loading resources
        loaded = {},
        loading = {},
        
        // store objects created from "module" declaration
        objects = {},
        
        // settings setter/getter
        config = function(name, value) {
            if (!settings[name]) throw name + ' is not recognised';
            if (value) settings[name] = value;
            else return settings[name];
        },
        
        // helper function to iterate over arrays (if key true return the key as first argument and balue second)
        each = function(arr, fn, key) {
            var len = arr.length, i = 0;
            for (; i < len; i++) fn.apply(null, key ? [i, arr[i]] : [arr[i]]);
        },
                
        // load a js file and execute a callback when it is loaded 
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
            head.appendChild(script);
        },
        
        // convert resources array into a hash string (used by the stack)
        getHash = function(resources) {
            return resources.join('');
        },
        
        // convert an array of resources into URLs pointing to the resource file
        convert = function(resources) {
            var arr = [];
            each(resources, function(resource) {
                if (/^(http\:\/\/|https\:\/\/|\.)/.test(resource)) arr.push(resource);
                else arr.push(settings.path + resource + '.js');
            });
            return arr;
        },
        
        // create an argument array made out of module required in the resources request
        args = function(resources) {
            var arr = [];
            each(resources, function(resource) {
                if (!/^(http\:\/\/|https\:\/\/|\.)/.test(resource)) arr.push(objects[resource]);
            });
            return arr;
        },
        
        // execute a stack of callback for a given request
        execute = function(hash) {
			each(stack[hash], function(j) {
				each(stack[hash][j].callbacks, function(i, callback) {
					if (settings.order) {
						if (!stack[hash][j][i - 1] && callback) {
							callback.apply(this, args(stack[hash][j].resources));
							stack[hash][j].callbacks.splice(i, 1);
							execute(hash);
						};
					}
					else callback.apply(this, args(stack[hash][j].resources));
				}, true);
			}, true);
        },
        
        // executed when a resource load, it checks for loading state of resources 
        // requested and call the execute function if criteria are met
        done = function(resources) {

            var good = true;

            each(convert(resources), function(resource) {
                if (loaded[resource] !== true) good = false;
            });
            
            if (good) execute(getHash(resources));
        },
        
        // process a resources request by loading them up
        process = function(files, resources) {
            each(files, function(i, resource) {
			
				// if object available just mark as loaded 
				if (objects[resources[i]]) loaded[resource] = true;
				
                if (loaded[resource]) done(resources);
                else if (!loading[resource] && !loaded[resource]) {
                    loading[resource] = true;
                    load(resource, function() {
                        loaded[resource] = true;
                        loading[resource] = false;
                        done(resources);
                    });
                };
            },true);
        },
        
        // handle a new resources request
        request = function(resources, callback) {
        
            var hash = getHash(resources);
            
            // add the callback to the stack
            if (!stack[hash]) stack[hash] = [];
			stack[hash].push({
				callbacks: [callback],
				resources: resources
			});

            process(convert(resources), resources);
        },
		
		register = function(name, object) {
			objects[name] = object;
			if (!objects[name].name) objects[name].name = name;
		},
        
        // used to create "modules"
        declare = function(name, object, imports) {
		
            if (!objects[name]) {
			
				if (typeof object == 'function') {
				
					if (!imports) register(name, object.apply(null));
					else {
					
						(function(name, object, imports) {
							console.log('importing');
							req(imports, function() {
								register(name, object.apply(null, arguments));
							});
						})(name, object, imports);
					};
				}
				else register(name, object);
				
            } else throw name + ' already exists!';
        };

    // strict type check helpers                
    each(['Array','String','Object','Function'], function(type) {
        global[type.substring(0, 3)] = function(it) {
            return it.constructor == window[type];
        };
    });
 
    // public
    req = function() {

        var args = arguments,
			argsLen = args.length,
            name;

        // 0 argument :(
        if (!argsLen) {
            return {
                settings: settings,
                objects: objects
            };
        };
        
        // 1 argument :|
        if (argsLen === 1) {
        
            // return an object (object must be loaded) var mod = req('module');
            if (global.Str(args[0])) {
                if (objects[args[0]]) return objects[args[0]];
                else throw args[0] + ' does not exists!';
            };
            
            // set multiple settings in one go req({});
            if (global.Obj(args[0])) {
                for (name in args[0]) config(name, args[0][name]);
            };
        };
        
        // 2 arguments :)
        if (argsLen === 2) {

            // request req([], function(){});
            if (global.Arr(args[0]) && global.Fun(args[1])) request(args[0], args[1]);
            
            // declaring a module req('module', {} || function(){});
            if (global.Str(args[0]) && (global.Obj(args[1]) || global.Fun(args[1]))) {
                declare(args[0], args[1]);
            };

            // configuration parameters setter req('path', './modules/'); and getter req('get','path');
            if (global.Str(args[0]) && global.Str(args[1])) {
                if (args[0] === 'get') return config(args[1]);
                else config(args[0], args[1]);
            };
        };
		
		if (argsLen === 3) {
				console.log(arguments);
			 // declaring a module req('module', {} || function(){}, []);
           // if (global.Str(args[0]) && (global.Obj(args[1]) || global.Fun(args[1])) && global.Arr(args[2])) {
                declare(args[0], args[2], args[1]);
           // };
		};
		
		return req;
    };
	
	// go native 
	Array.prototype.req = function(callback) {
		return req(this, callback);
	};

	Object.prototype.req = Function.prototype.req = function(name) {
		return req(name, this);
	};
	
	return req;

})(document);