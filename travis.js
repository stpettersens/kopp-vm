#!/usr/bin/env node
var cp = require('child_process');
var bickle = 'bickle builds stpettersens/kopp-vm -n 5';
cp.exec(bickle, function(err, stdout, stderr) {
	console.log(stdout);
});
