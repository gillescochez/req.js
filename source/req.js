/*! github.com/gillescochez/req.js */
var req = window.req || (function(doc) {

    // private
    var 
    
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
            if (!settings[name]) throw name + ' is not a configuration parameter';
            if (value) settings[name] = value;
            else return settings[name];
        },
        
        // helper function to iterate over arrays (if key true return the key as first argument and balue second)
        each = function(arr, fn, key) {
            var len = arr.length, i = 0;
            for (; i < len; i++) fn.apply(null, key ? [i, arr[i]] : [arr[i]]);
        },
        
        // strict type checker to simplify function overloading (see github.com/gillescochez/is.js for a full version independant)
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
                if (/^(http\:\/\/|https\:\/\/|\.)/.test(resource)) arr.push(resource);
                else arr.push(settings.path + resource + '.js');
            });
            return arr;
        },
        
        // create a argument array made out of module required in the resources request
        args = function(resources) {
            var arr = [];
            each(resources, function(resource) {
                if (!/^(http\:\/\/|https\:\/\/|\.)/.test(resource)) arr.push(objects[resource]);
            });
            return arr;
        },
        
        // execute a stack of callback for a given request
        execute = function(hash) {
            each(stack[hash].callbacks, function(i, callback) {
                if (settings.order) {
                    if (!stack[hash][i - 1] && callback) {
                        callback.apply(this, args(stack[hash].resources));
                        stack[hash].callbacks.splice(i, 1);
                        execute(hash);
                    };
                }
                else callback.apply(this, args(stack[hash].resources));
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
            each(files, function(resource) {
                if (loaded[resource]) done(resources);
                else if (!loading[resource] && !loaded[resource]) {
                    loading[resource] = true;
                    load(resource, function() {
                        loaded[resource] = true;
                        loading[resource] = false;
                        done(resources);
                    });
                };
            });
        },
        
        // handle a new resources request
        request = function(resources, callback) {
        
            var hash = getHash(resources);
            
            // add the callback to the stack
            if (!stack[hash]) {
                stack[hash] = {
                    callbacks: [],
                    resources: resources
                };
            };

            stack[hash].callbacks.push(callback);
            process(convert(resources), resources);
        },
        
        // used to create "modules"
        declare = function(name, object) {
            if (!objects[name]) {
                objects[name] = object;
                if (!objects[name].name) objects[name].name = name;
            } else throw name + ' already exists!';
        };

    // public
    return function() {

        var args = arguments;

        // 0 argument :(
        if (args.length === 0) {
            return {
                settings: settings,
                objects: objects
            };
        };
        
        // 1 argument :|
        if (args.length === 1) {
        
            // return an object (object must be loaded) var mod = req('module');
            if (is.String(args[0])) {
                if (objects[args[0]]) return objects[args[0]];
                else throw args[0] + ' does not exists!';
            };
            
            // set multiple settings in one go req({});
            if (is.Object(arguments[0])) {
                for (var name in args[0]) config(name, args[0][name]);
            };
        };
        
        // 2 arguments :)
        if (args.length === 2) {

            // request req([], function(){});
            if (is.Array(args[0]) && is.Function(args[1])) request(args[0], args[1]);
            
            // declaring a module req('module', {} || function(){});
            if (is.String(args[0]) && (is.Object(args[1]) || is.Function(args[1]))) {
                declare(args[0], args[1]);
            };

            // configuration parameters setter req('path', './modules/'); and getter req('get','path');
            if (is.String(args[0]) && is.String(args[1])) {
                if (args[0] === 'get') return config(args[1]);
                else config(args[0], args[1]);
            };
        };
        
        // chainability
        return req;
    };

})(document);
