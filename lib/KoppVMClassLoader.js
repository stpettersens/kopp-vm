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
			//var y = setAccessFlags(data);
			//y = setClass(data, y);
			printClassStructure();
		}
	});
};

function setClassSection(data, start, end, base) {
	var value = '';
	for(var i = start; i < end; i++) {
		value += data[i].toString(base);
	}
	return value;
} 

function setConstPoolArray(tag, count, data1, data2) {
	var array = '';
	if(data2 === null) {
		array = '{ "' + tag + '" : "' + count + ':' + data1 + '" }';
	}
	else {
		array = '{ "' + tag + '" : "' + count + ':' + data1 + ',' + data2 + '" }';
	}
	return JSON.parse(array);
}

function setMagicNumber(data) {
	var magic = setClassSection(data, 0, 4, 16);
	cf.ClassFile.magic = magic;
}

function checkMagicNumber() {
	if(!g.strcmp(cf.ClassFile.magic, 'cafebabe')) {
		app.displayError(stdErrMsg);
	}
	return true;
}

function setMinVersion(data) {
	var minVer = setClassSection(data, 4, 6, 10);
	cf.ClassFile.minor_version = minVer;
}

function setMajorVersion(data) {
	var majorVer = setClassSection(data, 6, 8, 10);
	cf.ClassFile.major_version = majorVer;
}

function setConstPoolCount(data) {
	var constPoolCount = setClassSection(data, 8, 10, 10);
	cf.ClassFile.constant_pool_count = parseInt(constPoolCount);
}

function getHexadecimalValue(data, i) {
	var value = '';
	var z = 2;
	while(true) {
		if(data[i+z] === 1 || data[i+z] === 0 || data[i+z] === 3 || data[i+z] === 4 ||
		data[i+z] === 7 || data[i+z] === 9  || data[i+z] === 6 || data[i+z] === 12 || 
		data[i+z] === 29 || data[i+z] === 56 || data[i+z] === 10) {
			break;
		}
		value += data[i+z].toString(16);
		z++;
	}
	return value;
}

function getHexadecimalValues(data, i) {
	var values = [];
	var z = 2;
	while(true) {
		if(data[i+z] === 1 || data[i+z] === 0 || data[i+z] === 3 || data[i+z] === 4 || 
		data[i+z] === 7 || data[i+z] === 9 || data[i+z] === 6 || data[i+z] === 12 || 
		data[i+z] === 29 ||  data[i+z] === 56 || data[i+z] === 10) {
			break;
		}
		values.push(data[i+z].toString(16));
		z++;
	}
	return values;
}

function getDecimalValue(hex) {
	return parseInt(hex, 16);
}

function getASCIIText(dec) {
	return String.fromCharCode(dec);
}

function setConstPoolTable(data) {
	var constPoolTable = [];
	var n = 10;
	var x = 1;
	var y = parseInt(cf.ClassFile.constant_pool_count, 10) * 9;

	for(var i = n; i < y; i++) {
		var tag = g.objGetKeyByValue(cf.tags, data[i]);
		var object = null;
		if(g.strcmp(tag, 'Methodref')) {
			object = setConstPoolArray(tag, x, data[i+2], data[i+4]);
		}
		else if(g.strcmp(tag, 'Class')) {
			object = setConstPoolArray(tag, x, data[i+2], null);
		}
		else if(g.strcmp(tag, 'Integer')) {
			var value = getHexadecimalValue(data, i);
			var integer = getDecimalValue(value);
			object = setConstPoolArray(tag, x, integer, null);
		}
		else if(g.strcmp(tag, 'String')) {
			object = setConstPoolArray(tag, x, data[i+2], null);
		}
		else if(g.strcmp(tag, 'Fieldref')) {
			object = setConstPoolArray(tag, x, data[i+2], data[i+4]);
		}
		else if(g.strcmp(tag, 'Utf8')) {
			var values = getHexadecimalValues(data, i+1);
			var utf8 = '';
			for(var z = 0; z < values.length; z++) {
				utf8 += getASCIIText(getDecimalValue(values[z]));
			}
			object = setConstPoolArray(tag, x, utf8, null);
		}
		if(tag !== undefined && object !== null) {
			constPoolTable.push(object);
			x++;
		}	
	}
	cf.ClassFile.constant_pool = constPoolTable;
}

function setAccessFlags(data) {
	var n = parseInt(cf.ClassFile.constant_pool.length);
	var y = n + 2;
	var accessFlags = '';
	for(var i = n; i < y; i++) {
		accessFlags += data[i].toString(16);
	}
	cf.ClassFile.access_flags = accessFlags;
	return y;
}

function setClass(data, n) {
	var thisClass = '';
	var y = n + 2;
	for(var i = n; i < y; i++) {
		thisClass += data[i].toString(16);
	}
	cf.ClassFile.this_class = thisClass;
	return y;
}

function printClassStructure() {
	g.println(cf.ClassFile);
}
