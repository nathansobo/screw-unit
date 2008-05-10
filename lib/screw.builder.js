var Screw = (function($) {
  var screw = {
    Unit: function(fn) {
      var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
      var fn = new Function("matchers", "specifications",
        "with (specifications) { with (matchers) { " + contents + " } }"
      );
    
      $(Screw).queue(function() {
        Screw.Specifications.context.push($('body > .describe'));
        fn.call(this, Screw.Matchers, Screw.Specifications);
        Screw.Specifications.context.pop();
        $(this).dequeue();
      });
    },
    
    Specifications: {
      context: [],
      
      describe: function(name, fn) {
        var describe = $('<li class="describe">');
        describe.append('<h1>' + name + '</h1>');
        describe
          .append('<ol class="befores">')
          .append('<ul class="its">')
          .append('<ul class="describes">')
          .append('<ol class="afters">')

        this.context.push(describe);
        fn.call();
        this.context.pop();
      
        this.context[this.context.length-1]
          .children('.describes')
            .append(describe);
      },
      
      it: function(name, fn) {
        var it = $('<li class="it">');
        it.append('<h2>' + name + '</h2>')
        it.data('screwunit.run', fn);
      
        this.context[this.context.length-1]
          .children('.its')
            .append(it);
      },
      
      before: function(fn) {
        var before = $('<li class="before">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.befores')
            .append(before);
      },
      
      after: function(fn) {
        var after = $('<li class="after">')
          .data('screwunit.run', fn);

        this.context[this.context.length-1]
          .children('.afters')
            .append(after);
      }
    }
  };
  
  $(screw).queue(function() { $(screw).trigger('loading') });
  $(function() {
    $('<div class="describe">')
      .append('<h3 class="status">')
      .append('<ol class="befores">')
      .append('<ul class="describes">')
      .append('<ol class="afters">')
      .appendTo('body');

    $(screw).dequeue();
    $(screw).trigger('load');
  });
  return screw;
})(jQuery);