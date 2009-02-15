module("Screw", function(c) { with(c) {
  module("Matchers", function() {
    def('equal', {
      match: function(expected, actual) {
        if(expected == actual) return true;
        if(actual == undefined) return false;

        if (expected instanceof Array) {
          if (!(actual instanceof Array)) return false;
          for (var i = 0; i < actual.length; i++)
            if (!Screw.Matchers.equal.match(expected[i], actual[i])) return false;
          return actual.length == expected.length;
        } else if (expected instanceof Object) {
          for (var key in expected)
            if (!this.match(expected[key], actual[key])) return false;
          for (var key in actual)
            if (!this.match(actual[key], expected[key])) return false;
          return true;
        }
        return false;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not equal ' : ' to equal ') + $.print(expected);
      }
    });

    def('be_gt', {
      match: function(expected, actual) {
        return actual > expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than ' + $.print(expected);
      }
    });

    def('be_gte', {
      match: function(expected, actual) {
        return actual >= expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than or equal to ' + $.print(expected);
      }
    });

    def('be_lt', {
      match: function(expected, actual) {
        return actual < expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not ' : ' to ') + 'be less than ' + $.print(expected);
      }
    });

    def('be_lte', {
      match: function(expected, actual) {
        return actual <= expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not ' : ' to ') + 'be less than or equal to ' + $.print(expected);
      }
    });

    def('match', {
      match: function(expected, actual) {
        if (expected.constructor == RegExp)
          return expected.exec(actual.toString());
        else
          return actual.indexOf(expected) > -1;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not match ' : ' to match ') + $.print(expected);
      }
    });

    def('be_empty', {
      match: function(expected, actual) {
        if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

        return actual.length == 0;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not be empty' : ' to be empty');
      }
    });

    def('have_length', {
      match: function(expected, actual) {
        if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

        return actual.length == expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not' : ' to') + ' have length ' + expected;
      }
    });

    def('be_null', {
      match: function(expected, actual) {
        return actual == null;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not be null' : ' to be null');
      }
    });

    def('be_undefined', {
      match: function(expected, actual) {
        return actual == undefined;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not be undefined' : ' to be undefined');
      }
    });

    def('be_true', {
      match: function(expected, actual) {
        return actual;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not be true' : ' to be true');
      }
    });

    def('be_false', {
      match: function(expected, actual) {
        return !actual;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not be false' : ' to be false');
      }
    });

    def('match_selector', {
      match: function(expected, actual) {
        if (!(actual instanceof jQuery)) {
          throw(new Error(expected.toString() + " must be an instance of jQuery to match against a selector"));
        }

        return actual.is(expected);
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not match selector ' : ' to match selector ') + expected;
      }
    });

    def('contain_selector', {
      match: function(expected, actual) {
        if (!(actual instanceof jQuery)) {
          throw(new Error(expected.toString() + " must be an instance of jQuery to match against a selector"));
        }

        return actual.find(expected).length > 0;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + $.print(actual) + (not ? ' to not contain selector ' : ' to contain selector ') + expected;
      }
    });

    def('have_been_called', {
      match: function(expected, actual) {
        return actual.call_count > 0;
      },

      failure_message: function(expected, actual, not) {
        if (not) {
          return 'expected ' + actual.function_name + ' to have not been called, but it was called ' + actual.call_count + ' time(s)';
        } else {
          return 'expected ' + actual.function_name + ' to have been called, but it was not';
        }
      }
    });
  });
}});