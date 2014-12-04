/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

// Internal includes.
var cf = require('./KoppVMClassFile.js');

// Node.js standard and module includes.
var fs = require('fs');
var g = require('generic-functions');
var hexy = require('hexy');
var colors = require('colors/safe');

var classLoader = exports;

classLoader.load = function(claSS, dump) {
	fs.readFile(claSS, function(err, data) {
		if(err) throw err;
		if(dump) {
			g.println(colors.bold(hexy.hexy(data)));
			return 0;
		}
		var magic = '';
		for(var i = 0; i < 4; i++) {
			magic += data[i].toString(16);
		}
		cf.ClassFile.magic = magic;
		g.println(cf);
	})
};
