const fs = require('fs');

/**
 * Getting all file names and path from directory (recursively)
 * @param dir
 * @returns {Array}
 */
var directoryWalk = function(dir) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(directoryWalk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

/**
 * Determining if given string contains beginning of function
 * @param str
 * @returns {boolean}
 */
const isJSFunction = (str) => {
  //NOTE :: add regex for ES6 function

  const fn = /\s*\(\s*([\s-a-zA-z0-9-\,-\s])*\)\s*\{/gi;
  const whileFn = /(while)\s*\(\s*([\s-a-zA-z0-9-\,-\s])*\)\s*\{/gi; //while (<...>) { <...>
  const ifFn = /(if)\s*\(\s*([\s-a-zA-z0-9-\,-\s])*\)\s*\{/gi; // if (<...>) { <...>
  const emptyFn = /\s*\(\s*([\s-a-zA-z0-9-\,-\s])*\)\s*\{\s*\}/gi; // (){} <...>
  const forIn = /(for)\s*\(\s*\w*\s*\w*\s*(in)\s*\w*\s*\)\s*\{/gi; // for (<let|var> <key> in <map|object>) { <...>
  const ifSwitch = /(switch)\s*\(\s*([\s-a-zA-z0-9-\,-\s])*\)\s*\{/gi; // switch(<key>) { <...>
  const es6Fn = /\s*\(\{?(\w*\s*\,*\s*)*\}?\s*\)\s*(\=\>)\s*\{\s*/gi;

  if (str.match(fn)){
    return !(str.match(whileFn) || str.match(ifFn) || str.match(ifSwitch) || str.match(emptyFn) || str.match(forIn));
  }

  return false;
};

/**
 * Getting the function name from function string
 * @param strWithFn
 * @returns {string}
 */
const getJSFunctionName = (strWithFn) => {
  const emberComputed = strWithFn.indexOf('Ember.') > -1;
  const constFn = strWithFn.indexOf('const') > -1 && strWithFn.indexOf('=') > -1;

  if (emberComputed){
    return strWithFn.split('Ember.')[0].split(':')[0].trim();
  }

  if (constFn){
    return strWithFn.split('=')[0].split('const')[1].trim();
  }

  return strWithFn.split('(')[0].trim();
};

module.exports = {
  isJSFunction: isJSFunction,
  getJSFunctionName: getJSFunctionName,
  directoryWalk: directoryWalk
};