/**
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.

@file Class loader for Kopp VM.
@author Sam Saint-Pettersen
@copyright (c) 2014 Sam Saint-Pettersen
@version 1.0.0
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

/**
 * @global
 * @name classLoader_load
 * @function
 * @description Load a Java classfile or dump loaded structure.
 * @param {string} claSS The classfile to load.
 * @param {boolean} dump If true: dump loaded classfile structure.
 * @returns {object} cf.ClassFile Classfile structure object.
*/
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
			//setAccessFlags();
			//setThisClass();
			//setSuperClass();
			//setInterfacesCount();
			//setInterfaces();
			//setFieldsCount();
			//setFields();
			//setMethodsCount();
			//setMethods();
			//setAttributesCount();
			//setAttributes();
			if(dump) {
				dumpClassStructure();
				return 0;
			}
			return cf.ClassFile;	
		}
	});
};

/**
 * Set a section of the loaded Java classfile structure object.
 * @param {integer} start The start byte in classfile.
 * @param {integer} end The end byte in classfile.
 * @param {integer} base Base of number system (e.g. 10 or 16).
 * @returns {string} value String value between start and end bytes.
*/
function setClassSection(start, end, base) {
	var value = '';
	for(var i = start; i < end; i++) {
		value += classContents[i].toString(base);
	}
	return value;
}

/**
 * Set and return a constant pool array or null for invalid data.
 * @param {string} tag The identifier tag for structure.
 * @param {string} data1 The first data value.
 * @param {string} data2 The second data value (optional).
 * @returns {JSONObject} array Const pool array or null.
*/
function setConstPoolArray(tag, data1, data2) {
	var array = '';
	if(data2 === null) {
		array = '{ "' + tag + '" : "' + data1 + '" }';
	}
	else {
		array = '{ "' + tag + '" : "' + data1 + ',' + data2 + '" }';
	}
	try {
		return JSON.parse(array);
	}
	catch(exception) {
		return null;
	}
}

/**
 * Set magic number for a Java classfile.
*/
function setMagicNumber() {
	var magic = setClassSection(0, 4, 16);
	cf.ClassFile.magic = magic;
}

/**
 * Check that set magic number is 0xCAFEBABE.
 * Return true or display error message and exit.
 * @returns {boolean} true If magic number is equal to 'cafebabe'.
*/
function checkMagicNumber() {
	if(!g.strcmp(cf.ClassFile.magic, 'cafebabe')) {
		app.displayError(stdErrMsg);
	}
	return true;
}

/**
 * Set minor classfile version (e.g. 0).
*/
function setMinVersion() {
	var minVer = setClassSection(4, 6, 10);
	cf.ClassFile.minor_version = parseInt(minVer, 10);
}

/**
 * Set major classfile version (e.g. 51).
*/
function setMajorVersion() {
	var majorVer = setClassSection(6, 8, 10);
	cf.ClassFile.major_version = parseInt(majorVer, 10);
}

/**
 * Set constant pool count for classfile.
*/
function setConstPoolCount() {
	var constPoolCount = setClassSection(8, 10, 10);
	cf.ClassFile.constant_pool_count = parseInt(constPoolCount);
}

/**
 * Get a hexadecimal value for a classfile byte offset.
 * @param {integer} i Index for a byte.
 * @param {intger} length Length of byte range to scan.
 * @returns {string} value Hexidecimal value as a string.
*/
function getHexadecimalValue(i, length) {
	var value = '';
	var z = 2;
	for(var j = 0; j < length; j++) {
		if(classContents[i+z] === 1 || classContents[i+z] === 3 || classContents[i+z] === 4 || 
		classContents[i+z] === 5 || classContents[i+z] === 6 || classContents[i+z] === 7 ||
		classContents[i+z] === 8 || classContents[i+z] === 9 || classContents[i+z] === 10 ||
		classContents[i+z] === '') {
			break;
		}
		value += classContents[i+z].toString(16);
		z++;
	}
	return value;
}

/**
 * Get hexadecimal values for a classfile byte offset.
 * @param {integer} i Index for a byte.
 * @param {integer} length Length of  byte range to scan.
 * @returns {string[]} values Hexdeicmal values as a string array.
*/
function getHexadecimalValues(i, length) {
	var values = [];
	var z = 2;
	for(var j = 0; j < length; j++) {
		if(classContents[i+z] === 1 || classContents[i+z] === 3 || classContents[i+z] === 4 || 
		classContents[i+z] === 5 || classContents[i+z] === 6 || classContents[i+z] === 7 ||
		classContents[i+z] === 8 || classContents[i+z] === 9 || classContents[i+z] === 10 || 
		classContents[i+z] === '') {
			break;
		}
		values.push(classContents[i+z].toString(16));
		z++;
	}
	return values;
}

/**
 * Get decimal integer value for a hexadecimal value.
 * @param {string} hex Hexadecimal value.
 * @returns {integer} int Integer value.
*/
function getIntValue(hex) {
	return parseInt(hex, 16);
}

/**
 * Get floating point value for a hexadecimal value.
 * @param {string} hex Hexadecimal value.
 * @returns {float} float Float value
*/
function getFloatValue(hex) {
	return parseFloat(hex, 16);
}

/**
 * Get UTF-8 character for a decimal integer value.
 * @param {integer} dec Decimal integer value.
 * @returns {string} char UTF-8 character as a string.
*/
function getUTF8Char(dec) {
	return String.fromCharCode(dec);
}

/**
 * Set constant pool table for classfile.
*/
function setConstPoolTable() {
	var constPoolTable = [];
	var n = 10;
	var x = 1;
	var y = getIntValue(cf.ClassFile.constant_pool_count) * 10;

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
			classContents[i+2] = 0;
			CPSIZE += 3;
		}
		else if(g.strcmp(tag, 'Integer')) {
			var value = getHexadecimalValue(i, 4, 4);
			classContents[i+1] = 0;
			classContents[i+2] = 0;
			classContents[i+3] = 0;
			classContents[i+4] = 0;
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
		/*else if(g.strcmp(tag, 'Fieldref')) {
			object = setConstPoolArray(tag, classContents[i+2], classContents[i+4]);
			CPSIZE += 5;
		}*/
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
			if(utf8.length > 2) {
				object = setConstPoolArray(tag, utf8, null);
			}
		}
		if(tag !== undefined && object !== null) {
			constPoolTable.push(object);
			x++;
		}
	}
	cf.ClassFile.constant_pool = constPoolTable;
	cf.ClassFile.cp_size = CPSIZE;
}

/**
 * Set access flags for classfile.
*/
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

/**
 * Set this class for classfile.
*/
function setThisClass() {
	var thisClass = classContents[CPSIZE+18].toString(16) + 
	classContents[CPSIZE+19].toString(16);
	cf.ClassFile.this_class = getIntValue(thisClass);
}

/**
 * Set super class for classfile.
*/
function setSuperClass() {
	var superClass = classContents[CPSIZE+20].toString(16) + 
	classContents[CPSIZE+21].toString(16);
	cf.ClassFile.super_class = getIntValue(superClass);
}

/**
 * Set interfaces count for classfile.
*/
function setInterfacesCount() {
	var interfacesCount = classContents[CPSIZE+22].toString(16) +
	classContents[CPSIZE+23].toString(16);
	cf.ClassFile.interfaces_count = getIntValue(interfacesCount);
}

/**
 * Set interfaces for classfile.
*/
function setInterfaces() {
	if(cf.ClassFile.interfaces_count > 0) {
		// TODO.
	}
}

/**
 * Set fields count for classfile.
*/
function setFieldsCount() {
	var fieldsCount = classContents[CPSIZE+24].toString(16) +
	classContents[CPSIZE+25].toString(16);
	cf.ClassFile.fields_count = getIntValue(fieldsCount);
}

/**
 * Set fields for classfile.
*/
function setFields() {
	if(cf.ClassFile.fields_count > 0) {
		// TODO.
	}
}

/**
 * Set methods count for classfile.
*/
function setMethodsCount() {
	var methodsCount = classContents[CPSIZE+26].toString(16) +
	classContents[CPSIZE+27].toString(16);
	cf.ClassFile.methods_count = getIntValue(methodsCount);
}

/**
 * Set methods for classfile.
*/
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

/**
 * Set attributes count for classfile.
*/
function setAttributesCount() {
	var attributesCount = classContents[CPSIZE+34].toString(16) +
	classContents[CPSIZE+35].toString(16);
	cf.ClassFile.attributes_count = getIntValue(attributesCount);
}

/**
 * Set attributes for classfile.
*/
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

/**
 * Trim constant pool table (remove duplicate entries in table).
*/
function trimConstPoolTable() {
	for(var i = 0; i < cf.ClassFile.constant_pool.length; i++) {
		var current = cf.ClassFile.constant_pool[i];
		var values = ['NaN','0'];
		for(var j = 0; j < values.length; j++) {
			var matched = g.objGetKeyByValue(current, values[j]);
			if(matched !== undefined) {
				cf.ClassFile.constant_pool.splice(i, 1);
				CPSIZE--;
			}
		}
	}
	cf.ClassFile.constant_pool.splice(cf.ClassFile.constant_pool.length-1, 1);
	CPSIZE--;
	cf.ClassFile.cp_size = CPSIZE;
}

/**
 * Dump the classfile structure object to console.
*/
function dumpClassStructure() {
	g.println(cf.ClassFile);
}
