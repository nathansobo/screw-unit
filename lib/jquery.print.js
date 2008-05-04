(function($) {
  $.print = function(obj) {
    if (typeof obj == 'undefined') {
      return "undefined"

    } else if (!obj) {
      return "null"

    // XXX in firefox, (function(){}) instanceof Function # => false
    } else if (obj instanceof Function) {
      return obj.toString().match(/^([^\{]*)\s{/)[1];

    } else if (obj instanceof Array) {
      var max = obj.length > $.print.options.maxArray ? $.print.options.maxArray : obj.length

      var result = [];
      for (var i = 0; i < max; i++) {
        result.push($.print(obj[i]));
      }

      if (obj.length > max)
        result.push('... ' + (obj.length - max) + ' more')

      return "[" + result.join(", ") + "]";

    } else if (obj instanceof HTMLElement) {
      return "<" + obj.tagName.toLowerCase() +
                   (obj.className != "" ? " class='" + obj.className + "'" : "") +
                   (obj.id != "" ? " id='" + obj.id + "'" : "") +
             ">";

    } else if (obj instanceof jQuery) {
      var result = []
      obj.each(function(){ result.push(this) })
      return "jQuery(length="+obj.length+")" + $.print(result)

    } else if (obj instanceof Object) {
      var result = [];
      for (var k in obj) {
        result.push(k + ": " + $.print(obj[k]))
      }
      return "{" + result.join(", ") + "}" 

    // XXX "abc" instanceof String # => false
    } else if (obj instanceof String) {
      if (obj.length > $.print.options.maxString)
        return obj.slice(0,$.print.options.maxString) + '...'
      else
        return obj

    } else {
      return obj.toString().replace(/\n\s*/g, "");
    }
  }

  $.print.options = {
    maxArray: 6,
    maxString: 50
  }
})(jQuery);