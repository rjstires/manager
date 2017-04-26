module.exports = {"name":"IPv6 Address","description":"An IPv6 Address\n","schema":{"address":{"_type":"string","_value":"2600:3c01::2:5001","_description":"The IPv6 Address."},"gateway":{"_type":"string","_value":"fe80::1","_description":"The default gateway."},"range":{"_type":"string","_value":"2600:3c01::2:5000","_description":"The IPv6 range."},"rdns":{"_type":"string","_value":"example.org","_description":"Optional reverse DNS address for this IPv6 Address."},"prefix":{"_type":"integer","_value":116,"_description":"The network prefix."},"subnet_mask":{"_type":"string","_value":"ffff:ffff:ffff:ffff:ffff:ffff:ffff:f000","_description":"The subnet mask."},"type":{"_type":"enum","_subtype":"IPv6AddressType","_value":"public","_description":"The type of IP Address, either public or private."}},"enums":{"IPv6AddressType":{"public":"Public IP Address","private":"Internal IP Addresses"}},"endpoints":null,"methods":null};