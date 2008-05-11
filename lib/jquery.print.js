(function($) {

  // helper functions

  function print_array(obj){
    var max = obj.length > $.print.options.maxArray ? $.print.options.maxArray : obj.length

    var result = [];
    for (var i = 0; i < max; i++) {
      result.push($.print(obj[i]));
    }

    if (obj.length > max)
      result.push('... ' + (obj.length - max) + ' more')

    if (result.length == 0) return "[]"
    return "[ " + result.join(", ") + " ]"
  }

  function print_element(obj){
    return "<" + obj.tagName.toLowerCase() +
                 (obj.className != "" ? " class='" + obj.className + "'" : "") +
                 (obj.id != "" ? " id='" + obj.id + "'" : "") +
           ">"
  }

  function print_object(obj){
    var result = []
    for (var k in obj) {
      result.push(k + ": " + $.print(obj[k]))
    }

    if (result.length == 0) return "{}"
    return "{ " + result.join(", ") + " }"
  }

  function print_jquery(obj){
    var result = []
    obj.each(function(){ result.push(this) })

    return "jQuery(length="+obj.length+")" + $.print(result)
  }

  function print_string(obj){
    if (obj.length > $.print.options.maxString)
      return obj.slice(0,$.print.options.maxString) + '...'
    else
      return obj
  }

  $.print = function(obj) {
    if (typeof obj == 'undefined')
      return "undefined"

    else if (typeof obj == 'boolean')
      return obj.toString()

    else if (!obj)
      return "null"

    else if ($.isFunction(obj))
      return obj.toString().match(/^([^\{]*)\s{/)[1]

    else if (obj instanceof Array)
      return print_array(obj)

    else if (obj instanceof HTMLElement)
      return print_element(obj)

    else if (obj instanceof jQuery)
      return print_jquery(obj)

    else if (obj instanceof Object)
      return print_object(obj)

    else if (typeof obj == "string")
      return print_string(obj)

    else
      return obj.toString().replace(/\n\s*/g, '')
  }

  $.print.options = {
    maxArray: 6,
    maxString: 50
  }
})(jQuery);