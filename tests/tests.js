test('Structure', function() {
    expect(2);
    ok(req === window.req, 'req is globally defined');
    ok(req.constructor == Function, 'req is a function');
});

test('Configuration', function() {

    // expected default object
    var expected = {
        settings: {
            path: './modules/',
            order: true
        },
        objects: {}
    };
    
    expect(6);
    
    // testing default configuration
    deepEqual(req(), expected, 'default object available');
    deepEqual(req().settings, expected.settings, 'default settings object');
    deepEqual(req().objects, expected.objects, 'default objects object');
    
    // configuration parameter getter
    equal(req('get','path'), expected.settings.path, 'configuration parameter getter');
    
    // configuration parameter setter
    var pathExpected = './';
    req('path', pathExpected);
    equal(req('get','path'), pathExpected, 'configuration parameter setter');
    req('path', expected.settings.path);
    
    // configuration changes via object (to change more than one parameter when we actually have more than one lol)
    req({path:pathExpected});
    equal(req('get','path'), pathExpected, 'configuration changes via object');
    req('path', expected.settings.path);
	
	
});

setTimeout(function() {

    req(['dummyObject','./jquery.js', 'dummyClass'], function(obj, clas) {
        test('Loading resources', function() {
        
            expect(7);
    
            ok(window.jQuery, 'jQuery in the global scope');
    
            ok(obj, 'dummyObject availability');
            ok(clas, 'dummyClass availability');
            
            equal(obj.name, 'dummyObject', 'object name');
            equal(clas.name, 'Class', 'class name');
            
            ok(obj.constructor == Object, 'dummyObject constructor Object');
            ok(clas.constructor == Function, 'dummyClass constructor Function');
        });
    });
}, 250);

setTimeout(function() {

    var foo = false;

    // order of callback
    req(['dummyObject','dummyClass'], function(obj, clas) {
    
        test('Callbacks ordering part 1', function() {
            expect(1);
            equal(foo, false, 'first ordered callback - foo should be false');
        });
        
        foo = true;
    });
    
    req(['dummyObject','dummyClass'], function(obj, clas) {
        test('Callbacks ordering part 2', function() {
            expect(1);
            equal(foo, true, 'second ordered callback - foo should be true as set in first callback');
        });
    });

}, 500);
