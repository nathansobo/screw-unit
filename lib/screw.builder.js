var Screw = {
  Unit: function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " + contents + " } }"
    );
    
    $(Screw).queue(function() {
      Screw.Specifications.context.push($('body'));
      fn.call(this, Screw.Matchers, Screw.Specifications);
      Screw.Specifications.context.pop();
      $(this).dequeue();
    });
  },
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
  },
  Matchers: {
    expect: function(actual) {
      return {
        to: function(matcher, expected, not) {
          var matched = matcher.match(expected, actual);
          if (not ? matched : !matched) {
            throw(matcher.failure_message(expected, actual, not));
          }
        },
        to_not: function(matcher, expected) {
          this.to(matcher, expected, true);
        }
      }
    },
    equal: {
      match: function(expected, actual) {
        if (Screw.Matchers.equal.by_type[expected.constructor.name])
          return Screw.Matchers.equal.by_type[expected.constructor.name](expected, actual);
        else
          return expected == actual;
      },
      failure_message: function(expected, actual, not) {
        return 'expected ' + $([actual]).print() + (not ? ' to not equal ' : ' to equal ') + $([expected]).print();
      },
      by_type: {
        Array: function(expected, actual) {
          for (var i = 0; i < actual.length; i++)
            if (!Screw.Matchers.equal.match(expected[i], actual[i])) return false;
          return actual.length == expected.length;
        },
        Object: function(expected, actual) {
          for (var key in expected)
            if (!Screw.Matchers.equal.match(expected[key], actual[key])) return false;
          for (var key in actual)
            if (!Screw.Matchers.equal.match(actual[key], expected[key])) return false;
          return true;
        }
      }
    },
    match: {
      match: function(expected, actual) {
        if (expected.constructor == String) {
          return actual.indexOf(expected) > -1;
        } else {
          return expected.exec(actual);
        }
      },
      failure_message: function(expected, actual, not) {
        return 'expected ' + $([actual]).print() + (not ? ' to not match ' : ' to match ') + $([expected]).print();
      }
    },
    be_empty: {
      match: function(expected, actual) {
        if (actual.length == undefined) {
          throw(actual.toString() + " does not respond to length");
        }
        return actual.length == 0;
      },
      failure_message: function(expected, actual, not) {
        return 'expected ' + $([actual]).print() + (not ? ' to not be empty' : ' to be empty');
      }
    }
  }
};

$(Screw).queue(function() { $(Screw).trigger('loading') });
$(function() {
  $('body')
    .append($('<h3 class="status">'))
    .append($('<ul class="describes">'))
  $(Screw).dequeue();
  $(Screw).trigger('load');
});