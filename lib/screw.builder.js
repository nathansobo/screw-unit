var Screw = {
  Unit: function(suite) {
    var contents = suite.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var suite = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " + contents + " } }"
    );
    
    if(!Screw.first_suite_loaded) {
      $(function() {
        Screw.Specifications.context.push(
          $('body')
            .append($('<h3 class="status">'))
            .append($('<ul class="describes">'))
        );
      })
      Screw.first_suite_loaded = true;
    }

    Screw.last_suite = suite;
    $(function() {
      suite.call(this, Screw.Matchers, Screw.Specifications);
      if(Screw.last_suite == suite) {
        $(Screw).trigger('loaded')
      }
    })
  },
  first_suite_loaded: false,
  last_suite: null,
  Specifications: {
    context: [],
    describe: function(name, fn) {
      var describe = $('<li class="describe">');
      $('<h1>').text(name).appendTo(describe);
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
      $('<h2>').text(name).appendTo(it);
      it.data('screwunit.run', fn);
      
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
    },
    after: function(fn) {
      var after = $('<li class="after">')
        .data('screwunit.run', fn);

      this.context[this.context.length-1]
        .find('.afters')
          .append(after);
    }
  },
  Matchers: {
    expect: function(actual) {
      return {
        to: function(matcher, expected, not) {
          var matched = matcher.match(expected, actual);
          if (not ? matched : !matched)
            throw(matcher.failure_message(expected, actual, not));
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
      failure_message: function(expected, actual, not) {
        // TESTME
        return 'expected ' + $([actual]).print() + (not ? ' to not equal ' : ' to equal ') + $([expected]).print();
      }
    },
    array_equal: {
      match: function(expected, actual) {
        for(var i = 0; i < actual.length; i++)
          if (actual[i] != expected[i]) { return false }
        return actual.length == expected.length;
      }
    },
    be_empty: {
      match: function(expected, actual) {
        if(actual.length == undefined) {
          throw(actual.toString() + " does not respond to length");
        }
        return actual.length == 0; 
      }
    }
  }
};