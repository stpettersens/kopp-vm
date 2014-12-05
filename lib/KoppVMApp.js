/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

// Internal includes.
var classLoader = require('./KoppVMClassLoader.js');

// Node.js standard and module includes.
var os = require('os');
var g = require('generic-functions');
var colors = require('colors/safe');

var koppVM = exports;
var app = {};
app.cliname = "koppvm";
app.program = "Kopp VM";
app.version = "1.0.0";
app.errorCode = -1;

// Invokation method; pass command line arguments to the JVM.
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

function loadClassFile(file, dump) {
	classLoader.load(file + '.class', dump);
}

// Display version information and exit.
function displayVersion() {
	g.println(colors.bold(app.program) + " v" + app.version + colors.italic(" running on ") +
	colors.green.bold("Node.js ") + colors.green(process.version) + " (" + os.platform() + ")");
	process.exit(0);
}

// Display an error.
koppVM.displayError = function(error) {
	g.println(colors.red.bold("\nError: " + error + "."));
	displayUsage(app.errorCode);
};

// Display usage information and exit.
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
	"-d | --dump: Dump binary data of class to console.",
	"-j | --jar: Invoke <jarFile>.",
	"\n--no-color: Turn off stylised and colored text to console."];
	g.printlns(usage);
	process.exit(exitCode);
}
