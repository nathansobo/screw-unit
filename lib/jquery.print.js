(function($) {
  $.print = function(obj) {
    if (obj instanceof Function) {
      return obj.toString().match(/^([^\{]*) {/)[1];
    } else if(obj instanceof Array) {
      var result = [];
      for (var i = 0; i < obj.length; i++) {
        result.push($.print(obj[i]));
      }
      return "[" + result.join(", ") + "]";
    } else if(obj instanceof HTMLElement) {
      return "<" + obj.tagName + " " + (obj.className != "" ? "class='" + obj.className + "'" : "") +
        (obj.id != "" ? "id='" + obj.id + "'" : "") + ">";
    } else if(obj instanceof Object) {
      var result = [];
      for (var k in obj) {
        result.push(k + ": " + $.print(obj[k]))
      }
      return "{" + result.join(", ") + "}" 
    } else {
      return obj.toString().replace(/\n\s*/g, "");
    }
  }
})(jQuery);