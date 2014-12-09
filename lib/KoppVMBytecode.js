/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

var bc = exports;

// Java bytecode instructions mnemonic to opcode "dictionary".
// This will be used by the engine module or "bytecode intepreter"
// to map a bytecode to its JVM instruction name (the mneomic).
bc.Bytecode = {
	aaload: 32,			// Load onto the stack a reference from an array.
	aastore: 53,		// Store into a  reference in an array.		
	aconst_null: 01,	// Push a null reference onto the stack.
	ldc: 12,			// Push a constant idx from a CP (String, int or float) onto the stack.
	istore_1: '3c',		// Store int value into variable 1.
	aload: 19,			// Load a reference onto the the stack from a local variable #index.
	aload_0: '2a', 		// Load a reference onto the stack from local variable 0.
	aload_1: '2b',		// Load a reference onto the stack from local variable 1.
	aload_2: '2c',		// Load a reference onto the stack from local variable 2.
	aload_3: '2d',		// Load a reference onto the stack from local variable 3.
	invokespecial, 'b7',// Invoke IM on object where the IM is identified by idx in CP.
	'return': 'b1'		// Return void from method.
};
// FYI: CP is Constant Pool; IM is instance method and idx is index.

// Java bytecodes which take one or more parameters.
bc.BytecodeWParams = {
	aconst_null: 1,
	ldc: 1,
	invokespecial: 2
};
