#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const _ = require('lodash');

const BASE_PATH = './src/data';
const ROUTE_BASE_PATH = `/${process.env.API_VERSION || 'v4'}/reference`;
const API_ROOT = process.env.API_ROOT || 'https://api.linode.com';
const API_VERSION = process.env.API_VERSION || 'v4';

const pythonPath = path.join(BASE_PATH, 'python');
const pythonFiles = fs.readdirSync(pythonPath);

const objectsPath = path.join(BASE_PATH, 'objects');
const apiObjectMap = {};
fs.readdirSync(objectsPath).filter(function(fileName) {
  return path.extname(fileName) === '.yaml';
}).forEach(function(fileName) {
  const filePath = path.join(objectsPath, fileName);
  apiObjectMap[fileName.split('.')[0].toLowerCase()] = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });
});

const endpointsPath = path.join(BASE_PATH, 'endpoints');
const files = fs.readdirSync(endpointsPath);

let allEndpoints = files.filter(function(fileName) {
  return path.extname(fileName) === '.yaml';
}).map(function(fileName) {
  const filePath = path.join(endpointsPath, fileName);
  const endpoint = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });

  return endpoint;
});

function stripATags(description) {
  if (description) {
    if (description.match(/href/)) {
      // First the obligatory warning messages
      // https://blog.codinghorror.com/parsing-html-the-cthulhu-way/
      // http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454
      // find '<a' the beginning of the tag
      // .* any character
      // ? non greedy meaning stop after you've found the first match
      // find '">' the end of the tag
      // (space star) [ *] find zero or more spaces
      // g global over the entire string
      description = description.replace(/<a.*?"> */g, '');
      description = description.replace(/<\/a>/g, '');
    }
  }
  return description;
}

function convertUlToArray(description) {
  let matches;
  const listItems = [];
  let descText;
  if (description) {
    if (typeof description === "string") {
      if (description.match(/<ul>/)) {
        descText = description.replace(/<ul>.*/, '');
        matches = description.match(/<li>.*?<\/li>/g);
        matches.forEach(function(mat) {
          listItems.push(mat.replace(/<li>/, '').replace(/<\/li>/, ''));
        });
        description = {descText, listItems};
      }
    }
  }
  return description;
}

function getResourceObjByName(name) {
  let resourceName = name.toLowerCase();
  let resourceObject = apiObjectMap[resourceName];
  if (!resourceObject && (resourceName.charAt(resourceName.length - 1) === 's')) {
    resourceObject = apiObjectMap[resourceName.substr(0, resourceName.length - 1)];
  }
  return resourceObject;
}

function formatMethodParams(methodObj) {
  let params;
  if (methodObj.params) {
    params = Object.keys(methodObj.params).map(function(paramName) {
      const param = methodObj.params[paramName];

      param.description = convertUlToArray(stripATags(param.description));

      const type = apiObjectMap[param.type] ? 'integer' : param.type;
      const required = !param.optional;
      return _.merge({}, param, {
        name: paramName,
        type: type,
        required: required
      });
    });
  }
  return params;
}

function formatMethodExamples(methodObj) {
  let examples;
  if (methodObj.examples) {
    examples = Object.keys(methodObj.examples).map(function(example) {
      return {
        name: example,
        value: methodObj.examples[example].replace(/https:\/\/\$api_root/g, API_ROOT).replace(/\$version/g, API_VERSION),
      };
    });
  }
  return examples;
}

function formatSchemaExample(schema) {
  const schemaExample = {};

  if (!Array.isArray(schema)) {
    // TODO: Account for objects / clean this method up
    return schemaExample;
  }

  schema.forEach(function(obj) {
    if (obj.value === undefined && obj.schema) {
      schemaExample[obj.name] = formatSchemaExample(obj.schema);
    } else {
      let value = obj.value;
      if (Array.isArray(value)) {
        value = value.map(function(obj) {
          if (typeof obj === 'object' && obj !== null) {
            return formatSchemaExample(obj);
          }
          return obj;
        });
      }

      schemaExample[obj.name] = value;
    }
  });

  return schemaExample;
}

function formatSchemaField(schemaField, enumMap) {
  let description;
  if (schemaField._description) {
    description = schemaField._description;
  } else {
    description = schemaField.description;
  }
  description = convertUlToArray(description);

  const name = schemaField.name;
  const seeAlso = schemaField._seeAlso;
  const editable = schemaField._editable;
  const filterable = schemaField._filterable;
  const type = schemaField._type;
  const lowerType = type ? type.toLowerCase() : null;
  const subType = schemaField._subtype;
  let value = schemaField._value;

  let nestedSchema = null;
  if (apiObjectMap[lowerType]) {
    // matches a known object from /objects, format using the reference
    nestedSchema = formatSchema(getResourceObjByName(lowerType).schema, enumMap);
  } else if (lowerType === 'enum' && enumMap[subType]) {
    // matches a known enum from an enums key on an object in /objects, format using the reference
    nestedSchema = enumMap[subType]; // already formatted
  } else if (lowerType === 'enum' || lowerType === 'object' || lowerType === 'array' || !lowerType) {
    // is of the the checked types, or no type provided (currently undocumented)
    nestedSchema = formatSchema(schemaField, enumMap);
  }

  // don't show filters for nestedSchemas
  if (Array.isArray(nestedSchema)) {
    nestedSchema.forEach(function(obj) {
      delete obj['filterable'];
    });
  }

  return {
    name: name,
    seeAlso: seeAlso,
    description: description,
    editable: editable,
    filterable: filterable,
    type: type,
    subType: subType,
    value: value,
    schema: nestedSchema
  };
}

function formatSchema(schema, enumMap={}) {
  if (Array.isArray(schema)) {
    return schema;
  }

  const filteredSchemas = Object.keys(schema).map(function (schemaName) {
    const val = schema[schemaName];
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      return formatSchemaField(_.merge(val, { name: schemaName }), enumMap);
    }
  }).filter(function(item) { return item; }); // filter at the end dumps nulls from result of non-object values

  // do not represent array types without nested objects in the schema tables
  if (!filteredSchemas.length) {
    return null;
  }

  return filteredSchemas;
}

function createEnumMap(enums) {
  const enumMap = {};

  Object.keys(enums).map(function(enumName) {
    const enumList = enums[enumName];

    enumMap[enumName] = Object.keys(enumList).map(function(key) {
      return {
        name: key,
        description: enumList[key]
      };
    });
  });

  return enumMap;
}

function formatMethodResource(endpoint, method) {
  // IF this is a GET endpoint and has an associated resource object, combine them
  let resourceObject;
  if (method === 'GET' && endpoint.resource) {
    let resource = endpoint.resource;

    // mismatch rewrites
    if (resource === 'account') {
      resource = 'profile';
    }

    resourceObject = getResourceObjByName(resource);

    let enums;
    let schema;
    if (resourceObject) {
      enums = resourceObject.enums;

      let enumMap;
      if (enums) {
        enumMap = createEnumMap(enums);
      }

      schema = resourceObject.schema;
      if (schema) {
        resourceObject.schema = formatSchema(schema, enumMap);
        resourceObject.example = formatSchemaExample(resourceObject.schema);
      }
    }
  }

  return resourceObject;
}

function formatMethod(endpoint, method) {
  const methodObj = endpoint.methods[method];
  methodObj.description = stripATags(methodObj.description);
  const resourceObj = formatMethodResource(endpoint, method);
  const examples = formatMethodExamples(methodObj);
  const params = formatMethodParams(methodObj);

  return _.merge({}, methodObj, {
    name: method,
    examples: examples,
    params: params,
    resource: resourceObj
  });
}

// map and nest
let endpointMap = {
  linodes: {
    name: 'Linodes',
    path: '/linode',
    routePath: `${ROUTE_BASE_PATH}/linode`,
    groups: {}
  },
  domains: {
    name: 'Domains',
    path: '/domains',
    routePath: `${ROUTE_BASE_PATH}/domains`,
    groups: {}
  },
  nodebalancers: {
    name: 'NodeBalancers',
    path: '/nodebalancers',
    routePath: `${ROUTE_BASE_PATH}/nodebalancers`,
    groups: {}
  },
  networking: {
    name: 'Networking',
    path: '/networking',
    routePath: `${ROUTE_BASE_PATH}/networking`,
    groups: {}
  },
  regions: {
    name: 'Regions',
    path: '/regions',
    routePath: `${ROUTE_BASE_PATH}/regions`,
    groups: {}
  },
  support: {
    name: 'Support',
    path: '/support',
    routePath: `${ROUTE_BASE_PATH}/support`,
    groups: {}
  },
  account: {
    name: 'Account',
    path: '/account',
    routePath: `${ROUTE_BASE_PATH}/account`,
    groups: {}
  },
};

allEndpoints.forEach(function(endpointContainer) {
  const containerName = endpointContainer.name.toLowerCase();
  const rawEndpoints = endpointContainer.endpoints;

  const endpoints = Object.keys(rawEndpoints).map(function(path) {
    const endpoint = rawEndpoints[path];

    let methods = null;
    if (endpoint.methods) {
      methods = Object.keys(endpoint.methods).map(function(method) {
        return formatMethod(endpoint, method);
      });
    }

    return _.merge({}, endpoint, {
      description: stripATags(endpoint.description),
      path: path,
      routePath: `${ROUTE_BASE_PATH}/endpoints${path}`,
      methods: methods
    });
  });

  // map groups from endpoint definitions, pushing each endpoint into it's group
  endpoints.forEach(function(endpoint) {
    if (!endpoint._group) {
      endpoint._group = 'default';
    }

    if (!endpointMap[containerName].groups[endpoint._group]) {
      endpointMap[containerName].groups[endpoint._group] = {
        label: endpoint._group,
        endpoints: []
      };
    }

    endpointMap[containerName].groups[endpoint._group].endpoints.push(endpoint);
  });
});

// covert to arrays and sort
allEndpoints = Object.keys(endpointMap).map(function(key) {
  const endpointIndex = endpointMap[key];

  // convert groups to an array
  endpointIndex.groups = Object.values(endpointIndex.groups);

  // alphabetically sort groups
  endpointIndex.groups = endpointIndex.groups.sort(function(a, b) {
    var nameA = a.label.toLowerCase();
    var nameB = b.label.toLowerCase();
    if ((nameA === 'default') || nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  });

  // alphabetically sort endpoints in groups
  endpointIndex.groups.forEach(function(group) {
    group.endpoints = group.endpoints.sort(function(a, b) {
      if (a.path < b.path) { return -1; }
      if (a.path > b.path) { return 1; }
      return 0;
    });
  });

  return endpointIndex;
}).filter(function(endpoint) { return endpoint; });

const data = JSON.stringify(allEndpoints, null, 2);
const endpointModule = `
  /**
  *   Generated Docs Source -- DO NOT EDIT
  */
  module.exports = { indices: ${data} };
`;
fs.writeFileSync(path.join('./src', 'api.js'), endpointModule);

/**
 *   Convert Python YAML docs to JSON js objects
 */

function convertPythonYaml() {
  let pythonObjects = pythonFiles.filter(function(fileName) {
    return path.extname(fileName) === '.yaml';
  }).map(function(fileName) {
    const filePath = path.join(pythonPath, fileName);
    const pythonObject = yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'), { json: true });

    return pythonObject;
  });

  let pythonObjectMap = {
    'LinodeLoginClient': {
      name: 'LinodeLoginClient',
      path: '/linode-login-client',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode-login-client',
      formattedPythonObject: [],
    },
    'LinodeClient': {
      name: 'LinodeClient',
      path: '/linode-client',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode-client',
      formattedPythonObject: [],
    },
    'Linode': {
      name: 'Linode',
      path: '/linode',
      langauge: 'python',
      routePath: '/v4/libraries/python/linode',
      formattedPythonObject: [],
    },
    'Config': {
      name: 'Config',
      path: '/config',
      langauge: 'python',
      routePath: '/v4/libraries/python/config',
      formattedPythonObject: [],
    },
    'Disk': {
      name: 'Disk',
      path: '/disk',
      langauge: 'python',
      routePath: '/v4/libraries/python/disk',
      formattedPythonObject: [],
    },
    'Region': {
      name: 'Region',
      path: '/region',
      langauge: 'python',
      routePath: '/v4/libraries/python/region',
      formattedPythonObject: [],
    },
    'Distribution': {
      name: 'Distribution',
      path: '/distribution',
      langauge: 'python',
      routePath: '/v4/libraries/python/distribution',
      formattedPythonObject: [],
    },
    'Backup': {
      name: 'Backup',
      path: '/backup',
      langauge: 'python',
      routePath: '/v4/libraries/python/backup',
      formattedPythonObject: [],
    },
    'IPAddress': {
      name: 'IPAddress',
      path: '/ipaddress',
      langauge: 'python',
      routePath: '/v4/libraries/python/ipaddress',
      formattedPythonObject: [],
    },
    'IPv6Address': {
      name: 'IPv6Address',
      path: '/ipv6address',
      langauge: 'python',
      routePath: '/v4/libraries/python/ipv6address',
      formattedPythonObject: [],
    },
    'Kernel': {
      name: 'Kernel',
      path: '/kernel',
      langauge: 'python',
      routePath: '/v4/libraries/python/kernel',
      formattedPythonObject: [],
    },
    'Service': {
      name: 'Service',
      path: '/service',
      langauge: 'python',
      routePath: '/v4/libraries/python/service',
      formattedPythonObject: [],
    },
    'StackScript': {
      name: 'StackScript',
      path: '/stackscript',
      langauge: 'python',
      routePath: '/v4/libraries/python/stackscript',
      formattedPythonObject: [],
    },
    'DNS Zone': {
      name: 'DNS Zone',
      path: '/dnszone',
      langauge: 'python',
      routePath: '/v4/libraries/python/dnszone',
      formattedPythonObject: [],
    },
    'DNS Zone Record': {
      name: 'DNS Zone Record',
      path: '/dnszone-record',
      langauge: 'python',
      routePath: '/v4/libraries/python/dnszone-record',
      formattedPythonObject: [],
    },
  };

  pythonObjects.forEach(function(pythonObject) {
    if (pythonObjectMap[pythonObject.name]) {
      pythonObjectMap[pythonObject.name].formattedPythonObject = pythonObject;
    }
  });
  const data = JSON.stringify(pythonObjectMap, null, 2);
  const pythonModule = `module.exports = { pythonObjects: ${data} };`;
  fs.writeFileSync(path.join('./src', 'python.js'), pythonModule);
}
convertPythonYaml();
