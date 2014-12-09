/*
Kopp VM
Node.js powered Java virtual machine (JVM)

Copyright 2014 Sam Saint-Pettersen

Released under the MIT/X11 License.
Please see LICENSE file.
*/

var cf = exports;

// A `class` file consists of a single `ClassFile` structure.
// This will be used by the class loader module as a template to store class data.
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

// This tags section will be used by the class loader as a data type to 
// representive byte "dictionary".
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
