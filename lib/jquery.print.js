(function($) {
  $.fn.print = function() {
    var obj = this.get();
    if (obj instanceof Function) {
      return obj.toString().match(/^([^\{]*) {/)[1];
    } else if(obj instanceof Array) {
      return "[" + obj.toString() + "]";
    } else if(obj instanceof HTMLElement) {
      return "<" + obj.tagName + " " + (obj.className != "" ? "class='" + obj.className + "'" : "") +
        (obj.id != "" ? "id='" + obj.id + "'" : "") + ">";
    } else {
      return obj.toString().replace(/\n\s*/g, "");
    }
  }
})(jQuery);