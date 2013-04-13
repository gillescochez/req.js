req('mod', ['dummyObject','dummyClass'], function() {
	console.log(arguments);
	return this;
});