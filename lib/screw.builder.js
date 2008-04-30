var Screw = {
  Unit: function(suite) {
    Screw.last_suite = suite;
    $("html").ready(function() {
      if(!Screw.root_element) {
        Screw.root_element = $('<div class="describe">');
        Screw.root_element
          .append('<h3 class="status">')
          .append('<ol class="befores">')
          .append('<ul class="its">')
          .append('<ul class="describes">')
          .append('<ol class="afters">')
        Screw.Specifications.context.push(Screw.root_element);
      }

      $(function() {
        $('body').append(Screw.root_element);
        var contents = suite.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
        var eval_suite = new Function("matchers", "specifications",
          "with (specifications) { with (matchers) { " + contents + " } }"
        );
        eval_suite.call(this, Screw.Matchers, Screw.Specifications);
        if(Screw.last_suite == suite) {
          $(Screw).trigger('loaded')
        }
      });
    });
  },
  root_element: null,
  last_suite: null,
  describes: {},
  befores: {},
  its: {},
  afters: {},
  assign_next_id: function(element) {
    Screw.current_id++;
    var id = "Screw_" + Screw.current_id;
    element.attr('id', id);
    return id
  },
  current_id: 0,
  Specifications: {
    context: [],
    describe: function(name, fn) {
      var describe = $('<li class="describe">');
      Screw.describes[Screw.assign_next_id(describe)] = fn;
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
      Screw.its[Screw.assign_next_id(it)] = fn;
      $('<h2>').text(name).appendTo(it);

      this.context[this.context.length-1]
        .children('.its')
          .append(it);
    },
    before: function(fn) {
      var before = $('<li class="before">');
      Screw.befores[Screw.assign_next_id(before)] = fn;
      this.context[this.context.length-1]
        .children('.befores')
          .append(before);
    },
    after: function(fn) {
      var after = $('<li class="after">');
      Screw.afters[Screw.assign_next_id(after)] = fn;
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
    match: {
      match: function(expected, actual) {
        if(typeof expected == "string") {
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
        if(actual.length == undefined) {
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
