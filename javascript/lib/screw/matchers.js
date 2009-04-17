module("Screw", function(c) { with(c) {
  module("Matchers", function() {
    def('equal', {
      match: function(expected, actual) {
        if(expected == actual) return true;
        if(actual == undefined) return false;

        if (expected instanceof Array) {
          if (! (actual instanceof Array)) return false;
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
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not equal ' : ' to equal ') + Screw.$.print(expected);
      }
    });

    def('be_gt', {
      match: function(expected, actual) {
        return actual > expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than ' + Screw.$.print(expected);
      }
    });

    def('be_gte', {
      match: function(expected, actual) {
        return actual >= expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be greater than or equal to ' + Screw.$.print(expected);
      }
    });

    def('be_lt', {
      match: function(expected, actual) {
        return actual < expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than ' + Screw.$.print(expected);
      }
    });

    def('be_lte', {
      match: function(expected, actual) {
        return actual <= expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not ' : ' to ') + 'be less than or equal to ' + Screw.$.print(expected);
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
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not match ' : ' to match ') + Screw.$.print(expected);
      }
    });

    def('be_blank', {
      match: function(expected, actual) {
        if (actual == undefined) return true;
        if (typeof(actual) == "string") actual = actual.replace(/^\s*(.*?)\s*$/, "$1");
        return Screw.Matchers.be_empty.match(expected, actual);
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be blank' : ' to be blank');
      }
    });

    def('be_empty', {
      match: function(expected, actual) {
        if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

        return actual.length == 0;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be empty' : ' to be empty');
      }
    });

    def('have_length', {
      match: function(expected, actual) {
        if (actual.length == undefined) throw(new Error(actual.toString() + " does not respond to length"));

        return actual.length == expected;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not' : ' to') + ' have length ' + expected;
      }
    });

    def('be_an_instance_of', {
      match: function(expected, actual) {
        return actual instanceof eval(expected);
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + typeof actual + (not ? ' not' : '') + ' be an instance of ' + expected;
      }
    });

    def('be_null', {
      match: function(expected, actual) {
        return actual == null;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be null' : ' to be null');
      }
    });

    def('be_undefined', {
      match: function(expected, actual) {
        return actual == undefined;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be undefined' : ' to be undefined');
      }
    });

    def('be_true', {
      match: function(expected, actual) {
        return actual;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be true' : ' to be true');
      }
    });

    def('be_false', {
      match: function(expected, actual) {
        return !actual;
      },

      failure_message: function(expected, actual, not) {
        return 'expected ' + Screw.$.print(actual) + (not ? ' to not be false' : ' to be false');
      }
    });

    def('have_been_called', {
      match: function(expected, actual) {
        if (expected) {
          return this.match_with_call_count_or_expected_args(expected, actual);
        } else {
          return actual.call_count > 0;
        }
      },

      match_with_call_count_or_expected_args: function(expected, actual) {
        if (typeof expected == "number") {
          return actual.call_count == expected;
        } else {
          return Screw.Matchers.equal.match(expected, actual.most_recent_args);
        }
      },

      call_count_or_expected_args_error_message: function(expected) {
        if (expected == null) return "";
        if (typeof expected == "number") {
          return expected + " time(s)";
        } else {
          return " with arguments " + Screw.$.print(expected);
        }
      },

      failure_message: function(expected, actual, not) {
        var message;
        if (not) {
          message = 'expected ' + actual.function_name + ' to have not been called ' + this.call_count_or_expected_args_error_message(expected);
        } else {
          message = 'expected ' + actual.function_name + ' to have been called ' + this.call_count_or_expected_args_error_message(expected);
        }
        message += ', but it was called ' + actual.call_count + ' time(s)';
        return message;
      }
    });

    def('once', 1);
    def('twice', 2);
    def('thrice', 3);

    def('with_args', function() {
      return Array.prototype.slice.call(arguments);
    });
  });
}});