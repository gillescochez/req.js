req(['dummyObject','./jquery.js', 'dummyClass'], function(obj, clas) {
	test('Loading resources', function() {
	
		expect(5);

		ok(window.jQuery, 'jQuery in the global scope');

		ok(obj, 'dummyObject availability');
		ok(clas, 'dummyClass availability');
		
		equal(obj.name, 'dummyObject', 'object name');
		equal(clas.name, 'dummyClass', 'class name');
	});
});

['dummyObject','./jquery.js', 'dummyClass'].req(function(obj, clas) {
	console.log('callback 1');
});

['dummyObject','./jquery.js', 'dummyClass'].req(function(obj, clas) {
	console.log('callback 2');
});