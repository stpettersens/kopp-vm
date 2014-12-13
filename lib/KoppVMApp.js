/**
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.

@file Entry point for Kopp VM.
@author Sam Saint-Pettersen
@copyright (c) 2014 Sam Saint-Pettersen
@version 1.0.0
*/

// Internal includes.
var classLoader = require('./KoppVMClassLoader.js');
var engine = require('./KoppVMEngine.js');

// Node.js standard and module includes.
var fs = require('fs');
var os = require('os');
var g = require('generic-functions');
var colors = require('colors/safe');

var koppVM = exports;
var app = {};
app.cliname = "koppvm";
app.program = "Kopp VM";
app.version = "1.0.0";
app.errorCode = -1;

/**
 * @global
 * @name koppVM_cli
 * @function
 * @description
 * Invokation method; pass command line arguments to the JVM.
 * @param {string[]} args Command line arguments.
*/
koppVM.cli = function(args) {

	if(args.length === 2) {
		koppVM.displayError("No command line options provided"); 
	}

	// Handle command line arguments.
	else if(args.length > 2 && args.length < 7) {

		for (var i = 2; i < args.length; i++) {

			if(g.strcmp(args[i], "-i")) { displayUsage(); }
			else if(g.strcmp(args[i], "-v")) { displayVersion(); }
			else if(g.strcmp(args[i], "-c") || g.strcmp(args[i], "--class")) {
				if(g.strcmp(args[i+1], "-d") || g.strcmp(args[i+1], "--dump")) {
					loadClassFile(args[i+2], true);
				}
				else {
					loadClassFile(args[i+1], false);
				}
			}
		}
	}
};

/**
 * Load a classfile and dump it or execute its bytecode.
 * @param {string} claSS Classfile to load.
 * @param {boolean} dump If true: dump loaded classfile structure.
*/
function loadClassFile(claSS, dump) {
	var cf = classLoader.load(claSS + '.class', dump); 
	//if(cf !== 0) engine.executeByteCode(claSS);
}

/**
 * Load a JAR file and dump it or execute its bytecode.
 * @param {string} jar Jar file to load.
 * @param {boolean} dump If true: dump loaded classfile structures.
*/
function loadJarFile(jar, dump) {
	//loadClassFile(claSS, dump);
}

/**
 * Display version information and exit.
*/
function displayVersion() {
	g.println(colors.bold(app.program) + " v" + app.version + colors.italic(" running on ") +
	colors.green.bold("Node.js ") + colors.green(process.version) + " (" + os.platform() + ")");
	process.exit(0);
}

/**
 * @global
 * @name koppVM_displayError
 * @function
 * @description 
 * Display an error, usage information and exit.
 * @param {string} error Error message.
*/
koppVM.displayError = function(error) {
	g.println(colors.red.bold("\nError: " + error + "."));
	displayUsage(app.errorCode);
};

/**
 * Display usage information and exit.
 * @param {integer} exitCode Exit code.
*/
function displayUsage(exitCode) {
	var usage = ["\nKopp VM",
	"Node.js powered Java virtual machine (JVM)",
	"\nCopyright (c) 2014 Sam Saint-Pettersen",
	"\nReleased under the MIT/X11 License.",
	"\n" + colors.bold(app.cliname) + " [-i|-v][-c|--class [-d|--dump] " + 
	colors.italic("<classFile>]"),
	"[-j|--jar " + colors.italic("<jarFile>") + "][--no-color]",
	"\n-i: Display usage information and quit.",
	"-v: Display version information and quit.",
	"-c | --class: Invoke <classFile>.",
	"-d | --dump: Dump class file structure to console and exit.",
	"-j | --jar: Invoke <jarFile>.",
	"\n--no-color: Turn off stylised and colored text to console."];
	g.printlns(usage);
	process.exit(exitCode);
}
