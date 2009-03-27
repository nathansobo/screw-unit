module("Screw", function(c) { with (c) {
  module("Keywords", function() {
    def('describe', function(name, fn) {
      Screw.push_description(new Screw.Description(name));
      fn();
      Screw.pop_description();
    });

    def('context', Screw.Keywords.describe);

    def('it', function(name, fn) {
      Screw.current_description().add_example(new Screw.Example(name, fn));
    });

    def('specify', Screw.Keywords.it);

    def('before', function(fn) {
      Screw.current_description().add_before(fn);
    });

    def('after', function(fn) {
      Screw.current_description().add_after(fn);
    });

    def('expect', function(actual) {
      var funcname = function(f) {
          var s = f.toString().match(/function (\w*)/)[1];
          if ((s == null) || (s.length == 0)) return "anonymous";
          return s;
      };

      var stacktrace = function() {
          var s = "";
          for(var a = arguments.caller; a != null; a = a.caller) {
              s += funcname(a.callee) + "\n";
              if (a.caller == a) break;
          }
          return s;
      };

      return {
        to: function(matcher, expected, not) {
          var matched = matcher.match(expected, actual);
          if (not ? matched : !matched) {
            throw(new Error(matcher.failure_message(expected, actual, not)));
          }
        },

        to_not: function(matcher, expected) {
          this.to(matcher, expected, true);
        }
      }
    });

    def('mock', function(object, method_name, method_mock) {
      if (!object[method_name]) {
        throw new Error("in mock_function: " + method_name + " is not a function that can be mocked");
      }
      var mock_function = this.mock_function(method_mock);
      mock_function.mocked_object = object;
      mock_function.function_name = method_name;
      mock_function.original_function = object[method_name];
      Screw.mocks.push(mock_function);
      object[method_name] = mock_function;

      return object;
    });

    def('mock_function', function() {
      var fn_to_call, function_name;

      if (arguments.length == 2) {
        function_name = arguments[0];
        fn_to_call = arguments[1];
      } else if (arguments.length == 1) {
        if (typeof arguments[0] == "function") {
          fn_to_call = arguments[0];
        } else {
          function_name = arguments[0];
        }
      }

      var mock_function = function() {
        var args_array = Array.prototype.slice.call(arguments)
        mock_function.call_count += 1;
        mock_function.call_args.push(args_array);
        mock_function.most_recent_args = args_array;

        if (fn_to_call) {
          return fn_to_call.apply(this, args_array);
        }
      };

      mock_function.function_name = function_name;
      mock_function.clear = function() {
        this.call_count = 0;
        this.call_args = [];
        this.most_recent_args = null;
      }
      mock_function.clear();
      return mock_function;
    });
  });
}});
