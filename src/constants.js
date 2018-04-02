/* eslint-disable no-undef */
export const API_ROOT = ENV_API_ROOT || 'https://api.linode.com/v4';
export const LOGIN_ROOT = ENV_LOGIN_ROOT || 'https://login.linode.com';
export const APP_ROOT = ENV_APP_ROOT || 'http://localhost:3000';
export const LISH_ROOT = ENV_LISH_ROOT || 'webconsole.linode.com';
export const GA_ID = ENV_GA_ID;
export const SENTRY_URL = ENV_SENTRY_URL;
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const DEVTOOLS_DISABLED = ENV_DEVTOOLS_DISABLED || ENVIRONMENT === 'production';
export const VERSION = ENV_VERSION;
/* eslint-enable no-undef */

export const EVENT_POLLING_DELAY = (5 * 1000); // milliseconds

export const RESULTS_PER_PAGE = 100;

export const LOGIN_SESSION_LIFETIME_MS = 45 * 60 * 1000;
export const OAUTH_TOKEN_REFRESH_TIMEOUT = LOGIN_SESSION_LIFETIME_MS / 2;

export const LinodeStates = {
  pending: [
    'booting',
    'rebooting',
    'shutting_down',
    'migrating',
    'provisioning',
    'deleting',
    'rebuilding',
    'restoring',
    'cloning',
  ],
};

export const REGION_MAP = {
  'North America': ['us-east', 'us-central', 'us-west', 'us-southeast'],
  Europe: ['eu-central', 'eu-west'],
  Asia: ['ap-northeast', 'ap-south', 'ap-northeast'],
};

// Still necessary for older DNS lookups.
export const ZONES = {
  'us-east': 'newark',
  'us-east-1a': 'newark',
  'us-south': 'dallas',
  'us-south-1a': 'dallas',
  'us-west': 'fremont',
  'us-west-1a': 'fremont',
  'us-central': 'dallas',
  'us-southeast': 'atlanta',
  'us-southeast-1a': 'atlanta',
  'eu-central': 'frankfurt',
  'eu-central-1a': 'frankfurt',
  'eu-west': 'london',
  'eu-west-1a': 'london',
  'ap-northeast': 'shinagawa1',
  'ap-northeast-1a': 'tokyo',
  'ap-northeast-1b': 'shinagawa1',
  'ap-south': 'singapore',
  'ap-south-1a': 'singapore',
};

export const UNAVAILABLE_ZONES = ['ap-northeast-1a'];

export const LinodeStatesReadable = {
  shutting_down: 'Powering Off',
  offline: 'Offline',
  running: 'Running',
  booting: 'Powering On',
  provisioning: 'Provisioning',
  rebooting: 'Rebooting',
  rebuilding: 'Rebuilding',
  restoring: 'Restoring',
};

export const NodebalancerStatusReadable = {
  active: 'Active',
  suspended: 'Suspended',
  canceled: 'Canceled',
  new_active: 'Active',
  new_suspended: 'Suspended',
};

export const ipv4ns = {
  'us-central': [
    '173.255.199.5',
    '66.228.53.5',
    '96.126.122.5',
    '96.126.124.5',
    '96.126.127.5',
    '198.58.107.5',
    '198.58.111.5',
    '23.239.24.5',
    '72.14.179.5',
    '72.14.188.5'],
  'us-west': [
    '173.230.145.5',
    '173.230.147.5',
    '173.230.155.5',
    '173.255.212.5',
    '173.255.219.5',
    '173.255.241.5',
    '173.255.243.5',
    '173.255.244.5',
    '74.207.241.5',
    '74.207.242.5'],
  'us-southeast': [
    '173.230.129.5',
    '173.230.136.5',
    '173.230.140.5',
    '66.228.59.5',
    '66.228.62.5',
    '50.116.35.5',
    '50.116.41.5',
    '23.239.18.5',
    '75.127.97.6',
    '75.127.97.7'],
  'us-east': [
    '66.228.42.5',
    '96.126.106.5',
    '50.116.53.5',
    '50.116.58.5',
    '50.116.61.5',
    '50.116.62.5',
    '66.175.211.5',
    '97.107.133.4',
    '207.192.69.4',
    '207.192.69.5'],
  'eu-west': [
    '178.79.182.5',
    '176.58.107.5',
    '176.58.116.5',
    '176.58.121.5',
    '151.236.220.5',
    '212.71.252.5',
    '212.71.253.5',
    '109.74.192.20',
    '109.74.193.20',
    '109.74.194.20'],
  'eu-central': [
    '139.162.130.5',
    '139.162.131.5',
    '139.162.132.5',
    '139.162.133.5',
    '139.162.134.5',
    '139.162.135.5',
    '139.162.136.5',
    '139.162.137.5',
    '139.162.138.5',
    '139.162.139.5'],
  'ap-northeast-1a': [
    '106.187.90.5',
    '106.187.93.5',
    '106.187.94.5',
    '106.187.95.5',
    '106.186.116.5',
    '106.186.123.5',
    '106.186.124.5',
    '106.187.34.20',
    '106.187.35.20',
    '106.187.36.20'],
  'ap-northeast': [
    '139.162.66.5',
    '139.162.67.5',
    '139.162.68.5',
    '139.162.69.5',
    '139.162.70.5',
    '139.162.71.5',
    '139.162.72.5',
    '139.162.73.5',
    '139.162.74.5',
    '139.162.75.5'],
  'ap-south': [
    '139.162.11.5',
    '139.162.13.5',
    '139.162.14.5',
    '139.162.15.5',
    '139.162.16.5',
    '139.162.21.5',
    '139.162.27.5',
    '103.3.60.18',
    '103.3.60.19',
    '103.3.60.20'],
};

// Temporary Aliases to handle south -> central rename
ipv4ns['us-south-1a'] = ipv4ns['us-central'];
ipv4ns['us-west-1a'] = ipv4ns['us-west'];
ipv4ns['us-southeast-1a'] = ipv4ns['us-southeast'];
ipv4ns['us-east-1a'] = ipv4ns['us-east'];
ipv4ns['eu-west-1a'] = ipv4ns['eu-west'];
ipv4ns['eu-central-1a'] = ipv4ns['eu-central'];
ipv4ns['ap-northeast-1b'] = ipv4ns['ap-northeast'];
ipv4ns['ap-south-1a'] = ipv4ns['ap-south'];

export const ipv6ns = {
  'us-central': '2600:3c00::',
  'us-south-1a': '2600:3c00::',
  'us-west': '2600:3c01::',
  'us-west-1a': '2600:3c01::',
  'us-southeast': '2600:3c02::',
  'us-southeast-1a': '2600:3c02::',
  'us-east': '2600:3c03::',
  'us-east-1a': '2600:3c03::',
  'eu-west': '2a01:7e00::',
  'eu-west-1a': '2a01:7e00::',
  'eu-central': '2a01:7e01::',
  'eu-central-1a': '2a01:7e01::',
  'ap-northeast-1a': '2400:8900::',
  'ap-northeast': '2400:8902::',
  'ap-northeast-1b': '2400:8902::',
  'ap-south': '2400:8901::',
  'ap-south-1a': '2400:8901::',
};

export const ipv6nsSuffix = ['5', '6', '7', '8', '9', 'b', 'c'];

export const NAME_SERVERS = [
  'ns1.linode.com', 'ns2.linode.com', 'ns3.linode.com', 'ns4.linode.com', 'ns5.linode.com',
];

export const OAUTH_SUBSCOPES = ['view', 'modify', 'create', 'delete'];

export const OAUTH_SCOPES = [
  'linodes', 'domains', 'nodebalancers', 'images', 'stackscripts', 'longview', 'events', 'tokens',
  'clients', 'account', 'users', 'tickets', 'ips', 'volumes',
];

// Set by API, but we can enforce it here to be nice.
export const MAX_UPLOAD_SIZE_MB = 5;

export const GRAVATAR_BASE_URL = 'https://gravatar.com/avatar/';

export const NODEBALANCER_CONFIG_ALGORITHMS = new Map([
  ['roundrobin', 'Round Robin'],
  ['leastconn', 'Least Connections'],
  ['source', 'Source IP'],
]);

export const NODEBALANCER_CONFIG_STICKINESS = new Map([
  ['none', '-- None --'],
  ['table', 'Table'],
  ['http_cookie', 'HTTP Cookie'],
]);

export const NODEBALANCER_CONFIG_CHECKS = new Map([
  ['connection', 'TCP Connection'],
  ['http', 'HTTP Valid Status'],
  ['http_body', 'HTTP Body Regex'],
]);

export const AVAILABLE_DISK_SLOTS = {
  kvm: [...'abcdefgh'].map(letter => `sd${letter}`),
  xen: [...'abcdefgh'].map(letter => `xvd${letter}`),
};

export const IPV4_DNS_RESOLVERS = [
  '66.228.42.5',
  '96.126.106.5',
  '50.116.53.5',
  '50.116.58.5',
  '50.116.61.5',
  '50.116.62.5',
  '66.175.211.5',
  '97.107.133.4',
  '207.192.69.4',
  '207.192.69.5',
];

export const IPV6_DNS_RESOLVERS = [
  '2600:3c03::5',
  '2600:3c03::6',
  '2600:3c03::7',
  '2600:3c03::8',
  '2600:3c03::9',
  '2600:3c03::b',
  '2600:3c03::c',
];

export const MONTHLY_IP_COST = 1;

export const DISTRIBUTION_DISPLAY_ORDER = [
  'ubuntu',
  'debian',
  'centos',
  'fedora',
  'arch',
  'coreos',
  'opensuse',
  'gentoo',
  'slackware',
];

export const DEFAULT_DISTRIBUTION = 'linode/Ubuntu16.04LTS';

export const AVAILABLE_VOLUME_REGIONS = ['us-east', 'us-central', 'us-west'];

export const BANNER_TYPES = {
  OUTAGE: 'outage',
  MIGRATION_SCHEDULED: 'migration_scheduled',
  MIGRATION_PENDING: 'migration_pending',
  REBOOT_SCHEDULED: 'reboot_scheduled',
  BALANCE_OUTSTANDING: 'payment_due',
  TICKET_IMPORTANT: 'ticket_important',
  TICKET_ABUSE: 'ticket_abuse',
  LINODE: 'linode',
};

export const Countries = {
  AF: 'Afghanistan',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaidjan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BA: 'Bosnia-Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CV: 'Cape Verde',
  KY: 'Cayman Islands',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos (Keeling) Islands',
  CO: 'Colombia',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'Congo, The Democratic Republic of the',
  CK: 'Cook Islands',
  CR: 'Costa Rica',
  CI: 'Cote D\'Ivoire (Ivory Coast)',
  HR: 'Croatia',
  CU: 'Cuba',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  TP: 'East Timor',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  ET: 'Ethiopia',
  FK: 'Falkland Islands',
  FO: 'Faroe Islands',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  FX: 'France (European Territory)',
  GF: 'French Guyana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam ',
  GT: 'Guatemala',
  GN: 'Guinea',
  GW: 'Guinea Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard and McDonald Islands',
  VA: 'Holy See (Vatican City State)',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran',
  IQ: 'Iraq',
  IE: 'Ireland',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'Korea, Democratic People\'s Republic of',
  KR: 'Korea, Republic of',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Laos',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libyan Arab Jamahiriya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macau',
  MK: 'Macedonia',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MQ: 'Martinique ',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia',
  MD: 'Moldavia',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  AN: 'Netherlands Antilles',
  NC: 'New Caledonia (French)',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MP: 'Northern Mariana Islands',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PN: 'Pitcairn Island',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  RE: 'Reunion ',
  RO: 'Romania',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  KN: 'Saint Kitts & Nevis',
  LC: 'Saint Lucia',
  VC: 'Saint Vincent & Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia & S. Sandwich Isls.',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SH: 'St. Helena',
  PM: 'St. Pierre and Miquelon',
  SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen Islands',
  SZ: 'Swaziland',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TJ: 'Tadjikistan',
  TW: 'Taiwan',
  TZ: 'Tanzania',
  TH: 'Thailand',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands',
  TV: 'Tuvalu',
  UM: 'USA Minor Outlying Islands',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela',
  VN: 'Vietnam',
  VG: 'Virgin Islands (British)',
  VI: 'Virgin Islands (USA)',
  WF: 'Wallis and Futuna Islands',
  EH: 'Western Sahara',
  YE: 'Yemen',
  YU: 'Yugoslavia',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};
