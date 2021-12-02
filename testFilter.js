const parents = require('ldap-filter')

const filters = [
  'CN=Правление ВТБ,OU=Distribution Groups,OU=Groups,OU=MSK_VTB,DC=region,DC=vtb,DC=ru',
  'CN=Сотрудники Москва (прописка-SAP-ИКС),OU=All_Staff,OU=Distribution Groups,OU=Groups,OU=MSK_VTB,DC=region,DC=vtb,DC=ru'
];


function escapedToHex (str) {
  return str.replace(/\\([0-9a-f](?![0-9a-f])|[^0-9a-f]|$)/gi, function (match, p1) {
    if (!p1) {
      return '\\5c'
    }

    const hexCode = p1.charCodeAt(0).toString(16)
    return '\\' + hexCode
  })
}

function parseString (str) {
  const hexStr = escapedToHex(str)
  const generic = parents.parse(hexStr)
  // The filter object(s) return from ldap-filter.parse lack the toBer/parse
  // decoration that native ldapjs filter possess.  cloneFilter adds that back.
}

// partially stolen from https://github.com/tcort/ldap-escape/blob/master/index.js
const escapeLdapDnValue = (value) => {
  const replacements = {
    filter: {
      '\u0000': '\\00', // NUL
      '\u0028': '\\28', // (
      '\u0029': '\\29', // )
      '\u002a': '\\2a', // *
      '\u005c': '\\5c', // \
    },
  };

  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000\u0028\u0029\u002a\u005c]/gm, (ch) => replacements.filter[ch]);
};

const escapeLdapDn = (dn) => {
  return dn
    .split(',')
    .map((current) => {
      const replaceString = '<==>';
      const formattedString = current.replace(/=/, replaceString);
      const [key, value] = formattedString.split(replaceString);
      return [key, escapeLdapDnValue(value)].join('=');
    })
    .join(',');
};

function parseDistinguishedName(dn) {
  if (! dn) return(dn);

  dn = dn.replace(/"/g, '\\"');
  return(dn.replace('\\,', '\\\\,'));
}

filters.forEach((current) => {
  const parsed = parseDistinguishedName(current);
  const filter = '(member=' + escapeLdapDn(current) + ')';
  console.log('filter', JSON.stringify({ filter }));
  parseString(filter)
});