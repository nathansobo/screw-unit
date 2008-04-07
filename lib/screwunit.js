var Screw = {
  Unit: function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " + contents + " } }"
    )
    
    $(function() {
      Screw.Specifications.context.push(
        $('body')
          .append($('<h3 class="status">'))
          .append($('<ul class="describes">'))
      );
      fn.call(this, Screw.Matchers, Screw.Specifications);
      $(Screw).trigger('loaded');
      var to_run = unescape(location.search.slice(1)) || 'body > .describes > .describe';
    });
  },
  Specifications: {
    context: [],
    describe: function(name, fn) {
      var b = new XmlBuilder();
      with (b) {
        li({class: 'describe'}, function() {
          h1(name);
          ol({class: 'befores'});
          ul({class: 'its'});
          ul({class: 'describes'});
        });
      }
      var describe = $(b.toString());
      this.context.push(describe);
      fn.call(describe);
      this.context.pop();
      
      this.context[this.context.length-1]
        .children('.describes')
          .append(describe);
    },
    it: function(name, fn) {
      var b = new XmlBuilder();
      with (b) {
        li({class: 'it'}, function() {
          h2(name);
        });
      }
      var it = $(b.toString())
        .data('screwunit.run', fn);
      this.context[this.context.length-1]
        .children('.its')
          .append(it);
    },
    before: function(fn) {
      var before = $('<li class="before">')
        .data('screwunit.run', fn);
      this.context[this.context.length-1]
        .find('.befores')
          .append(before);
    }
  },
  Matchers: {
    expect: function(actual) {
      return {
        to: function(matcher, expected, not) {
          var matched = matcher.match(expected, actual);
          if (not ? matched : !matched)
            throw(matcher.failure_message(expected, actual));
        },
        to_not: function(matcher, expected) {
          this.to(matcher, expected, true);
        }
      }
    },
    equal: {
      match: function(expected, actual) {
        if (expected instanceof Array)
          return Screw.Matchers.array_equal.match(actual, expected);
        else
          return actual == expected;
      },
      failure_message: function(expected, actual) {
        return 'expected ' + $(actual).print() + ' to equal ' + $(expected).print();
      }
    },
    array_equal: {
      match: function(expected, actual) {
        for(var i = 0; i < actual.length; i++)
          if (actual[i] != expected[i]) { return false }
        return actual.length == expected.length;
      }
    }
  }
};