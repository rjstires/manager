module.exports = {"name":"NodeBalancer Config Node","description":"Describes a configuration node for a NodeBalancer.\n","schema":{"id":{"_editable":false,"_type":"integer","_value":804,"_description":"An integer"},"label":{"_editable":true,"_type":"string","_value":"node001","_description":"Unique label for your NodeBalancer config"},"address":{"_editable":true,"_type":"string","_value":"192.168.12.12:80","_description":"The address:port combination used to communicate with this Node."},"weight":{"_editable":true,"_type":"integer","_value":20,"_description":"Load balancing weight, 1-255. Higher means more connections."},"mode":{"_editable":true,"_type":"enum","_subtype":"mode","_value":"accept","_description":"The connections mode for this node. One of 'accept', 'reject', or 'drain'."},"status":{"_type":"string","_value":"UP","_description":"The status of this node."}},"enums":{"mode":{"accept":"accept","reject":"reject","drain":"drain"},"status":{"UP":"UP","DOWN":"DOWN","MAINT":"Under Maintenance","Unknown":"Unknown"}}};