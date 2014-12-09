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

var classLoader = exports;
var stdErrMsg = "Invalid or corrupted classFile";
var classContents = null;
var CPSIZE = 0;
var ISIZE = 0;
var FSIZE = 0;
var MSIZE = 0;
var ASIZE = 0;

classLoader.load = function(claSS, dump) {
	fs.readFile(claSS, function(err, data) {
		if(err) { app.displayError(err); }
		if(data.length === 0) {
			app.displayError(stdErrMsg);
		}
		classContents = data;
		setMagicNumber();
		if(checkMagicNumber()) {
			setMinVersion();
			setMajorVersion();
			setConstPoolCount();
			setConstPoolTable();
			trimConstPoolTable();
			setAccessFlags();
			setThisClass();
			setSuperClass();
			setInterfacesCount();
			setInterfaces();
			setFieldsCount();
			setFields();
			setMethodsCount();
			setMethods();
			setAttributesCount();
			setAttributes();
			if(dump) {
				printClassStructure();
				return 0;
			}
			return cf.ClassFile;	
		}
	});
};

function setClassSection(start, end, base) {
	var value = '';
	for(var i = start; i < end; i++) {
		value += classContents[i].toString(base);
	}
	return value;
}

function setConstPoolArray(tag, data1, data2) {
	var array = '';
	if(data2 === null) {
		array = '{ "' + tag + '" : "' + data1 + '" }';
	}
	else {
		array = '{ "' + tag + '" : "' + data1 + ',' + data2 + '" }';
	}
	return JSON.parse(array);
}

function setMagicNumber() {
	var magic = setClassSection(0, 4, 16);
	cf.ClassFile.magic = magic;
}

function checkMagicNumber() {
	if(!g.strcmp(cf.ClassFile.magic, 'cafebabe')) {
		app.displayError(stdErrMsg);
	}
	return true;
}

function setMinVersion() {
	var minVer = setClassSection(4, 6, 10);
	cf.ClassFile.minor_version = parseInt(minVer, 10);
}

function setMajorVersion() {
	var majorVer = setClassSection(6, 8, 10);
	cf.ClassFile.major_version = parseInt(majorVer, 10);
}

function setConstPoolCount() {
	var constPoolCount = setClassSection(8, 10, 10);
	cf.ClassFile.constant_pool_count = parseInt(constPoolCount);
}

function getHexadecimalValue(i, length) {
	var value = '';
	var z = 2;
	for(var j = 0; j < length; j++) {
		if(classContents[i+z] === 1 || classContents[i+z] === 3 || classContents[i+z] === 4 || 
		classContents[i+z] === 5 || classContents[i+z] === 6 || classContents[i+z] === 7 ||
		classContents[i+z] === 8 || classContents[i+z] === 9 || classContents[i+z] === 10) {
			break;
		}
		value += classContents[i+z].toString(16);
		z++;
	}
	return value;
}

function getHexadecimalValues(i, length) {
	var values = [];
	var z = 2;
	for(var j = 0; j < length; j++) {
		if(classContents[i+z] === 1 || classContents[i+z] === 3 || classContents[i+z] === 4 || 
		classContents[i+z] === 5 || classContents[i+z] === 6 || classContents[i+z] === 7 ||
		classContents[i+z] === 8 || classContents[i+z] === 9 || classContents[i+z] === 10) {
			break;
		}
		values.push(classContents[i+z].toString(16));
		z++;
	}
	return values;
}

function getIntValue(hex) {
	return parseInt(hex, 16);
}

function getFloatValue(hex) {
	return parseFloat(hex, 16);
}

function getUTF8Char(dec) {
	return String.fromCharCode(dec);
}

function setConstPoolTable(data) {
	var constPoolTable = [];
	var n = 10;
	var x = 1;
	var y = parseInt(cf.ClassFile.constant_pool_count, 10) * 10;

	for(var i = n; i < y; i++) {
		var tag = g.objGetKeyByValue(cf.tags, classContents[i]);
		var object = null;
		if(g.strcmp(tag, 'Methodref')) {
			var byte1 = classContents[i+2];
			var byte2 = classContents[i+4];
			classContents[i+2] = 0; // Set to 0 byte to prevent re-read of byte.
			classContents[i+4] = 0;
			object = setConstPoolArray(tag, byte1, byte2);
			CPSIZE += 5;
		}
		else if(g.strcmp(tag, 'Class')) {
			object = setConstPoolArray(tag, classContents[i+2], null);
			CPSIZE += 3;
		}
		else if(g.strcmp(tag, 'Integer')) {
			var value = getHexadecimalValue(i, 4, 4);
			var integer = getIntValue(value);
			object = setConstPoolArray(tag, integer, null);
			CPSIZE += 5;
		}
		/*else if(g.strcmp(tag, 'Long')) { // ! Not fully implemented!
			var value = getHexadecimalValue(i, 4, 8);
			var lonG = getIntValue(value);
			object = setConstPoolArray(tag, lonG, null);
			CPSIZE += 9;
		}
		else if(g.strcmp(tag, 'Float')) { 
			var value = getHexadecimalValue(i, 4, 4);
			var floaT = getFloatValue(value);
			object = setConstPoolArray(tag, floaT, null);
			CPSIZE += 5;
		}
		else if(g.strcmp(tag, 'Double')) { // ! Not fully implemented!
			var value = getHexadecimalValue(i, 4, 8);
			var doublE = getFloatValue(value);
			object = setConstPoolArray(tag, doublE, null);
			CPSIZE += 9;
		}*/
		else if(g.strcmp(tag, 'String')) {
			object = setConstPoolArray(tag, classContents[i+2], null);
			CPSIZE += 3;
		}
		else if(g.strcmp(tag, 'Fieldref')) {
			object = setConstPoolArray(tag, classContents[i+2], classContents[i+4]);
			CPSIZE += 5;
		}
		else if(g.strcmp(tag, 'NameAndType')) {
			var byteA = classContents[i+2];
			var byteB = classContents[i+4];
			classContents[i+2] = 0; 
			classContents[i+4] = 0;
			object = setConstPoolArray(tag, byteA, byteB);
			CPSIZE += 5;
		}
		else if(g.strcmp(tag, 'Utf8')) {
			CPSIZE += 2;
			var size = classContents[i+2];
			classContents[i+2] = 0; 
			var values = getHexadecimalValues(i+1, size);
			var utf8 = '';
			for(var z = 0; z < values.length; z++) {
				utf8 += getUTF8Char(getIntValue(values[z]));
				CPSIZE++;
			}
			object = setConstPoolArray(tag, utf8, null);
		}
		if(tag !== undefined && object !== null) {
			constPoolTable.push(object);
			x++;
		}
	}
	cf.ClassFile.constant_pool = constPoolTable;
	cf.ClassFile.cp_size = CPSIZE;
}

function setAccessFlags() {
	var accessFlags = classContents[CPSIZE+17].toString(16);
	var wordFlags = '';
	if(accessFlags % 1 == 0) wordFlags += ' ACC_PUBLIC';
	if(accessFlags % 10 == 0) wordFlags += ' ACC_FINAL';
	if(accessFlags % 20 == 0) wordFlags += ' ACC_SUPER';
	if(accessFlags % 200 == 0) wordFlags += ' ACC_INTERFACE';
	if(accessFlags % 400 == 0) wordFlags += ' ACC_ABSTRACT';
	cf.ClassFile.access_flags = wordFlags;
}

function setThisClass() {
	var thisClass = classContents[CPSIZE+18].toString(16) + 
	classContents[CPSIZE+19].toString(16);
	cf.ClassFile.this_class = getIntValue(thisClass);
}

function setSuperClass() {
	var superClass = classContents[CPSIZE+20].toString(16) + 
	classContents[CPSIZE+21].toString(16);
	cf.ClassFile.super_class = getIntValue(superClass);
}

function setInterfacesCount() {
	var interfacesCount = classContents[CPSIZE+22].toString(16) +
	classContents[CPSIZE+23].toString(16);
	cf.ClassFile.interfaces_count = getIntValue(interfacesCount);
}

function setInterfaces() {
	if(cf.ClassFile.interfaces_count > 0) {
		// TODO.
	}
}

function setFieldsCount() {
	var fieldsCount = classContents[CPSIZE+24].toString(16) +
	classContents[CPSIZE+25].toString(16);
	cf.ClassFile.fields_count = getIntValue(fieldsCount);
}

function setFields() {
	if(cf.ClassFile.fields_count > 0) {
		// TODO.
	}
}

function setMethodsCount() {
	var methodsCount = classContents[CPSIZE+26].toString(16) +
	classContents[CPSIZE+27].toString(16);
	cf.ClassFile.methods_count = getIntValue(methodsCount);
}

function setMethods() {
	var methods = [];
	if(cf.ClassFile.methods_count > 0) {
		var object = JSON.parse('{ "access_flags" : "' +
		classContents[CPSIZE+28].toString(16) +
		classContents[CPSIZE+29].toString(16) +
		'", "name_index" : "' +
		classContents[CPSIZE+30].toString(16) +
		classContents[CPSIZE+31].toString(16) + 
		'", "descriptor_index" : "' +
		classContents[CPSIZE+32].toString(16) +
		classContents[CPSIZE+33].toString(16) + 
		'",  "attributes_count" : "' +
		classContents[CPSIZE+34].toString(16) +
		classContents[CPSIZE+35].toString(16) + '" }');
		methods.push(object);
		cf.ClassFile.methods = methods;
	}
}

function setAttributesCount() {
	var attributesCount = classContents[CPSIZE+34].toString(16) +
	classContents[CPSIZE+35].toString(16);
	cf.ClassFile.attributes_count = getIntValue(attributesCount);
}

function setAttributes() {
	var attributes = [];
	if(cf.ClassFile.attributes_count > 0) {
		var object = JSON.parse('{ "attribute_name_index" : "' +
		classContents[CPSIZE+36].toString(16) + 
		classContents[CPSIZE+37].toString(16) + 
		'", "attribute_length" : "' +
		parseInt(classContents[CPSIZE+40] +
		classContents[CPSIZE+41], 10) +
		'", "bytecode" : "' +
		classContents[CPSIZE+50].toString(16) + ',' +
		classContents[CPSIZE+51].toString(16) + ',' +
		classContents[CPSIZE+52].toString(16) + ',' +
		classContents[CPSIZE+53].toString(16) + ',' +
		classContents[CPSIZE+54].toString(16) + '" }');
		attributes.push(object);
		cf.ClassFile.attributes = attributes;
	}
}

function trimConstPoolTable() {
	for(var i = 0; i < cf.ClassFile.constant_pool.length; i++) {
		var current = cf.ClassFile.constant_pool[i];
		var values = ['NaN'];
		for(var j = 0; j < values.length; j++) {
			var matched = g.objGetKeyByValue(current, values[j]);
			if(matched !== undefined) {
				cf.ClassFile.constant_pool.splice(i, 1);
				CPSIZE--;
			}
		}
	}
	cf.ClassFile.cp_size = CPSIZE;
}

function printClassStructure() {
	g.println(cf.ClassFile);
}
