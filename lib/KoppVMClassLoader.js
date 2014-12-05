/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

// Internal includes.
var app = require('./KoppVMApp.js');
var cf = require('./KoppVMClassFile.js');

// Node.js standard and module includes.
var fs = require('fs');
var g = require('generic-functions');
var hexy = require('hexy');
var colors = require('colors/safe');

var classLoader = exports;
var stdErrMsg = "Invalid or corrupted classFile";

classLoader.load = function(claSS, dump) {
	fs.readFile(claSS, function(err, data) {
		if(err) { app.displayError(err); }
		if(data.length === 0) {
			app.displayError(stdErrMsg);
		}
		if(dump) {
			g.println(colors.bold(hexy.hexy(data)));
			return 0;
		}
		setMagicNumber(data);
		if(checkMagicNumber()) {
			setMinVersion(data);
			setMajorVersion(data);
			setConstPoolCount(data);
			setConstPoolTable(data);
			var y = setAccessFlags(data);
			//y = setClass(data, y);
			printClassStructure();
		}
	});
};

function setMagicNumber(data) {
	var magic = '';
	for(var i = 0; i < 4; i++) {
		magic += data[i].toString(16);
	}
	cf.ClassFile.magic = magic;
}

function checkMagicNumber() {
	if(!g.strcmp(cf.ClassFile.magic, 'cafebabe')) {
		app.displayError(stdErrMsg);
	}
	return true;
}

function setMinVersion(data) {
	var minVer = '';
	for(var i = 4; i < 6; i++) {
		minVer += data[i].toString(16);
	}
	cf.ClassFile.minor_version = minVer;
}

function setMajorVersion(data) {
	var majorVer = '';
	for(var i = 6; i < 8; i++) {
		majorVer += data[i].toString(16);
	}
	cf.ClassFile.major_version = majorVer;
}

function setConstPoolCount(data) {
	var constPoolCount = '';
	for(var i = 8; i < 10; i++) {
		constPoolCount += data[i].toString(10);
	}
	cf.ClassFile.constant_pool_count = parseInt(constPoolCount);
}

function setConstPoolTable(data) {
	var constPoolTable = [];
	var i = 10;
	var y = i + parseInt(cf.ClassFile.constant_pool_count, 10);
	for(var i = i; i < y; i++) {
		constPoolTable.push(data[i].toString(16));
	}
	cf.ClassFile.constant_pool = constPoolTable;
}

function setAccessFlags(data) {
	var i = parseInt(cf.ClassFile.constant_pool.length);
	var y = i + 2;
	var accessFlags = '';
	for(var i = i; i < y; i++) {
		accessFlags += data[i].toString(16);
	}
	cf.ClassFile.access_flags = accessFlags;
	return y;
}

function setClass(data, i) {
	var thisClass = '';
	var y = i + 2;
	for(var i = i; i < y; i++) {
		thisClass += data[i].toString(16);
	}
	cf.ClassFile.this_class = thisClass;
	return y;
}

function printClassStructure() {
	g.println(cf.ClassFile);
}
