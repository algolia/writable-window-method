module.exports = writableWindowMethod;

var forEach = require('lodash-compat/collection/forEach');
var isArray = require('lodash-compat/lang/isArray');
var map = require('lodash-compat/collection/map');

var original = {};

function writableWindowMethod(propNames) {
  if (!isArray(propNames)) {
    propNames = [propNames];
  }

  forEach(propNames, function saveNative(propName) {
    original[propName] = window[propName];
  });

  var firstScript = map(propNames, function appendToFirstScript(propName) {
    return 'if ("' + propName + '" in window) { window.originalWritableWindowProps["' + propName + '"] = window["' + propName + '"]; }';
  }).join('');

  var secondScript = map(propNames, function appendToSecondScript(propName) {
    return 'if ("' + propName + '" in window) { function ' + propName + '() {}; window["' + propName + '"] = window.originalWritableWindowProps["' + propName + '"]; }';
  }).join('');

  // create the module "namespace" in `window`
  insertInlineScript('window.originalWritableWindowProps = {};');

  // make propNames overwritable
  forEach([firstScript, secondScript], insertInlineScript);
}

function insertInlineScript(scriptContent) {
  var inlineScript = document.createElement('script');
  inlineScript.type = 'text/javascript';
  inlineScript.text = scriptContent;
  document.getElementsByTagName('head')[0].appendChild(inlineScript);
}

writableWindowMethod.original = original;

writableWindowMethod.restore = function() {
  forEach(original, function resetOriginalMethod(propName) {
    window[propName] = original[propName];
  });

  original = writableWindowMethod.original = {};
};
