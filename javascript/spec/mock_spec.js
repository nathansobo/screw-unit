Screw.Unit(function(c) { with(c) {
  describe("#mock", function() {
    context("when passed an object and the name of a function on that object", function() {
      var object;
      before(function() {
        object = {
          foo: function() {
            return "original_foo_value";
          }
        };
        mock(object, 'foo');
      });

      it("records the #call_count on that function", function() {
        expect(object.foo.call_count).to(equal, 0);
        object.foo();
        expect(object.foo.call_count).to(equal, 1);
        object.foo();
        expect(object.foo.call_count).to(equal, 2);
      });

      it("pushes the arguments of the call to a #call_args array on that function", function() {
        expect(object.foo.call_args).to(equal, []);
        object.foo("bar", "baz");
        expect(object.foo.call_args).to(equal, [["bar", "baz"]]);
        object.foo("quux");
        expect(object.foo.call_args).to(equal, [["bar", "baz"], ["quux"]]);
      });

      it("sets #most_recent args on the function", function() {
        expect(object.foo.most_recent_args).to(equal, null);
        object.foo("bar", "baz");
        expect(object.foo.most_recent_args).to(equal, ["bar", "baz"]);
        object.foo("quux");
        expect(object.foo.most_recent_args).to(equal, ["quux"]);
      });
      
      context("when passed a function as its third argument", function() {
        var call_args;
        before(function() {
          call_args = [];
          mock(object, "foo", function() {
            call_args.push(Array.prototype.slice.call(arguments));
          });
        });

        it("calls the function", function() {
          object.foo("bar", "baz");
          expect(call_args).to(equal, [["bar", "baz"]]);
          object.foo("quux");
          expect(call_args).to(equal, [["bar", "baz"], ["quux"]]);
        });
      });
    });
  })

  describe("#mock_function", function() {
    var mock_fn;
    before(function() {
      mock_fn = mock_function();
    });

    it("records the #call_count on that function", function() {
      expect(mock_fn.call_count).to(equal, 0);
      mock_fn();
      expect(mock_fn.call_count).to(equal, 1);
      mock_fn();
      expect(mock_fn.call_count).to(equal, 2);
    });

    it("pushes the arguments of the call to a #call_args array on that function", function() {
      expect(mock_fn.call_args).to(equal, []);
      mock_fn("bar", "baz");
      expect(mock_fn.call_args).to(equal, [["bar", "baz"]]);
      mock_fn("quux");
      expect(mock_fn.call_args).to(equal, [["bar", "baz"], ["quux"]]);
    });

    it("sets #most_recent args on the function", function() {
      expect(mock_fn.most_recent_args).to(equal, null);
      mock_fn("bar", "baz");
      expect(mock_fn.most_recent_args).to(equal, ["bar", "baz"]);
      mock_fn("quux");
      expect(mock_fn.most_recent_args).to(equal, ["quux"]);
    });

    it("pushes the 'this' value of the call to a #this_values array and sets #most_recent_this_vaule", function() {
      var a = { mock_fn: mock_fn };
      var b = { mock_fn: mock_fn };

      expect(mock_fn.this_values).to(equal, []);
      expect(mock_fn.most_recent_this_value).to(be_null);
      a.mock_fn();
      expect(mock_fn.this_values).to(equal, [a]);
      expect(mock_fn.most_recent_this_value).to(equal, a);

      b.mock_fn();
      expect(mock_fn.this_values).to(equal, [a, b]);
      expect(mock_fn.most_recent_this_value).to(equal, b);
    });

    context("when passed a function_name as its only argument", function() {
      it("assigns function_name to the given name", function() {
        var mock_fn = mock_function("function name");
        expect(mock_fn.function_name).to(equal, "function name");
      });
    });

    context("when passed a function as its only argument", function() {
      var this_value, call_args;
      before(function() {
        call_args = [];
        mock_fn = mock_function(function() {
          this_value = this;
          call_args.push(Array.prototype.slice.call(arguments));
        });
      });

      it("calls the function with the same 'this'", function() {
        var a = { mock_fn: mock_fn };
        var b = { mock_fn: mock_fn };
        a.mock_fn("bar", "baz");
        expect(this_value).to(equal, a);
        expect(call_args).to(equal, [["bar", "baz"]]);

        b.mock_fn("quux");
        expect(this_value).to(equal, b);
        expect(call_args).to(equal, [["bar", "baz"], ["quux"]]);
      });
    });

    context("when passed a function_name and a function as its arguments", function() {
      it("assigns function_name to the given name and calls the function when it is called", function() {
        var function_to_call = mock_function("function to call");
        var mock_fn = mock_function("function name", function_to_call);
        expect(mock_fn.function_name).to(equal, "function name");
        
        mock_fn();

        expect(function_to_call).to(have_been_called);
      });
    });

    describe("#clear on the results of #mock_function", function() {
      it("resets all recorded call data", function() {
        var a = { mock_fn: mock_fn };
        a.mock_fn("foo");

        expect(mock_fn.this_values).to(equal, [a]);
        expect(mock_fn.most_recent_this_value).to(equal, a);
        expect(mock_fn.call_count).to(equal, 1);
        expect(mock_fn.call_args).to(equal, [["foo"]]);
        expect(mock_fn.most_recent_args).to(equal, ["foo"]);

        mock_fn.clear();

        expect(mock_fn.this_values).to(equal, []);
        expect(mock_fn.most_recent_this_value).to(equal, null);
        expect(mock_fn.call_count).to(equal, 0);
        expect(mock_fn.call_args).to(equal, []);
        expect(mock_fn.most_recent_args).to(equal, null);
      });
    });

  });
}});