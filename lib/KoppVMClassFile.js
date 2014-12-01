/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

var magic = parseInt('CAFEBABE', 16); // Magic value: 0xCAFEBABE.
var minor_version = 0;
var major_version = 0;
var constant_pool_count = 0;
var access_flags = parseInt('0001', 16); // 0x0001: Public.
var this_class = 0;
var super_class = 0;
var interfaces_count = 0;
var fields_count = 0;
var methods_count = 0;
var attributes_count = 0;
var attributes = 0;

// A `class` file consists of a single `ClassFile` structure.
var ClassFile = {
    u4a: magic,
    u2b: minor_version,
    u2c: major_version,
    u2d: constant_pool_count,
    cp_info: constant_pool[constant_pool_count-1],
    u2e: access_flags,
    u2f: this_class,
    u2g: super_class,
    u2h: interfaces_count,
    u2i: interfaces[interfaces_count],
    u2j: fields_count,
    field_info: fields[fields_count],
    u2k: methods_count,
    method_info: methods[methods_count],
    u2l: attributes_count,
    attribute_info: attributes[attributes_count]
};
