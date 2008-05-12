(function($) {

  // helper functions

  function print_array(obj, opts){
    opts.maxString = 40
    var max = obj.length > opts.maxArray ? opts.maxArray : obj.length

    var result = [];
    for (var i = 0; i < max; i++) {
      result.push($.print(obj[i], opts));
    }

    if (obj.length > max)
      result.push('... ' + (obj.length - max) + ' more')

    if (result.length == 0) return "[]"
    return "[ " + result.join(", ") + " ]"
  }

  function print_element(obj){
    if (obj.nodeType == 1)
      return "<" + obj.tagName.toLowerCase() +
                   (obj.className != "" ? " class='" + obj.className + "'" : "") +
                   (obj.id != "" ? " id='" + obj.id + "'" : "") +
             ">"
  }

  function print_object(obj, opts){
    opts.maxString = 40
    if (!opts.seen) opts.seen = []

    var result = []
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.apply(obj, [k]) &&
          $.inArray(obj[k], opts.seen) == -1) {
        opts.seen.push(obj[k])
        result.push(k + ": " + $.print(obj[k], opts))
      }
    }

    if (result.length == 0) return "{}"
    return "{ " + result.join(", ") + " }"
  }

  function print_jquery(obj){
    var result = []
    obj.each(function(){ result.push(this) })

    return "jQuery(length="+obj.length+")" + $.print(result)
  }

  function print_string(value, opts){
    // adapted from json2.js
    var m = {    // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    }

    var r = /["\\\x00-\x1f\x7f-\x9f]/g

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe sequences.

    var str = r.test(value) ?
        '"' + value.replace(r, function (a) {
            var c = m[a];
            if (c) {
                return c;
            }
            c = a.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) +
                                       (c % 16).toString(16);
        }) + '"' :
        '"' + value + '"';


    if (opts.maxString && str.length > opts.maxString)
      return str.slice(0, opts.maxString) + '..."'
    else
      return str
  }

  $.print = function(obj, options) {
    var opts = $.extend({}, $.print.options, options || {})

    if (typeof obj == 'undefined')
      return "undefined"

    else if (typeof obj == 'boolean')
      return obj.toString()

    else if (!obj && typeof obj == 'number')
      return 'NaN'

    else if (!obj)
      return "null"

    else if (typeof obj == 'string')
      return print_string(obj, opts)

    else if (typeof obj == 'function' || obj instanceof Function)
      return (m = obj.toString().match(/^([^\{]*?)\s*{/)) ? m[1].replace(' (','(') : 'function()'

    else if (obj instanceof Array)
      return print_array(obj, opts)

    else if (obj.nodeType) // no HTMLElement in IE6
      return print_element(obj)

    else if (obj instanceof jQuery)
      return print_jquery(obj)

    else if (obj instanceof Object)
      return print_object(obj, opts)

    else
      return obj.toString().replace(/\n\s*/g, '')
  }

  $.print.options = {
    maxArray: 10,
    maxString: 0
  }
})(jQuery);