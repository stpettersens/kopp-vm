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
    constant_pool_count: 0,
    constant_pool: [],
    cp_size: 0,
    access_flags: 0,
    this_class: 0,
    super_class: 0,
    interfaces_count: 0,
    interfaces: [],
    fields_count: 0,
    fields: [],
    methods_count: 0,
    methods: [],
    attributes_count: 0,
    attributes: []
};

cf.tags = {
    Class: 7,
    Fieldref: 9,
    Methodref: 10,
    InterfaceMethodref: 11,
    String: 8,
    Integer: 3,
    Float: 4,
    Long: 5,
    Double: 6,
    NameAndType: 12,
    Utf8: 1
};

/*
    u4: magic;
    u2: minor_version;
    u2: major_version;
    u2: constant_pool_count;
    cp_info: constant_pool[constant_pool_count-1];
    u2: access_flags;
    u2: this_class;
    u2: super_class;
    u2: interfaces_count;
    u2: interfaces[interfaces_count];
    u2: fields_count;
    field_info: fields[fields_count];
    u2: methods_count;
    method_info: methods[methods_count];
    u2: attributes_count;
    attribute_info: attributes[attributes_count];
};
*/
