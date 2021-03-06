test('Structure', function() {
    expect(5);
    ok(req === window.req, 'req is globally defined');
    ok(req.constructor == Function, 'req is a function');
    ok([].req, 'req extends []');
    ok(({}).req, 'req extends {}');
    ok((function(){}).req, 'req extends function');
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