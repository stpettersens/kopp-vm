/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

// Internal includes.
// ...

// Node.js standard and module includes.
var fs = require('fs');
var os = require('os');
var g = require('generic-functions');
var colors = require('colors/safe');

var koppVM = exports;
var app = {};
app.program = "Kopp VM";
app.version = "1.0.0";
app.errorCode = -1;

// Invokation method; pass command line arguments to the JVM.
koppVM.cli = function(args) {

	if(args.length === 2) { /* TODO. */ }

	// Handle command line arguments.
	else if(args.length > 2 && args.length < 7) {

		for (var i = 2; i < args.length; i++) {

			if(g.strcmp(args[i], "-i")) { displayUsage(); }
			else if(g.strcmp(args[i], "-v")) { displayVersion(); }
		}
	}
};

// Display version information and exit.
function displayVersion() {
	g.println(colors.bold(app.program) + " v" + app.version + colors.italic(" running on ") +
	colors.green.bold("Node.js ") + colors.green(process.version) + " (" + os.platform() + ")");
	process.exit(0);
}

// Display an error.
koppVM.displayError = function(error) {
	g.println(colors.red.bold("\nError with: " + error + "."));
	displayUsage(app.errorCode);
};

// Display usage information and exit.
function displayUsage(exitCode) {
	var usage = ["\nKopp VM",
	"Node.js powered Java virtual machine (JVM)",
	"\nCopyright (c) 2014 Sam Saint-Pettersen",
	"\nReleased under the MIT/X11 License.",
	"\n"];
	g.printlns(usage);
	process.exit(exitCode);
}
