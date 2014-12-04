/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

var cf = exports;

// A `class` file consists of a single `ClassFile` structure.
cf.ClassFile = {
    magic: 0,
    minor_version: 0,
    major_version: 0,
};
/*
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
*/
