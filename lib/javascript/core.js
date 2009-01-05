module("Screw", function(c) { with (c) {
  def('Unit', function(specification) {
    specification(new Screw.Context());
  });

  def('current_description', function() {
    return this.description_stack()[this.description_stack().length - 1];
  });

  def('push_description', function(description) {
    this.current_description().add_description(description);
    this.description_stack().push(description);
  });

  def('pop_description', function() {
    this.description_stack().pop();
  });

  def('description_stack', function() {
    if (!this._description_stack) {
      this._description_stack = [this.global_description()];
    }
    return this._description_stack;
  });

  def('global_description', function() {
    return this._global_description = this._global_description || new Screw.Description("");
  });

  def('each', function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn.call(array[i]);
    }
  });

  def('reverse_each', function(array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
      fn.call(array[i]);
    }
  });

  module("Keywords", function() {
    def('describe', function(name, fn) {
      Screw.push_description(new Screw.Description(name));
      fn();
      Screw.pop_description();
    });

    def('it', function(name, fn) {
      Screw.current_description().add_example(new Screw.Example(name, fn));
    })

    def('before', function(fn) {
      Screw.current_description().add_before(fn);
    })

    def('after', function(fn) {
      Screw.current_description().add_after(fn);
    })

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

  });

  constructor("Context", function() {
    include(Screw.Matchers);
    include(Screw.Keywords);
  });

  constructor("Description", function() {
    def('initialize', function(name) {
      this.name = name;
      this.child_descriptions = [];
      this.examples = [];
      this.befores = [];
      this.afters = [];
      this.fail_subscription_node = new Screw.SubscriptionNode();
      this.pass_subscription_node = new Screw.SubscriptionNode();
    });

    def('add_description', function(description) {
      description.parent_description = this;
      this.child_descriptions.push(description);
    })

    def('add_example', function(example) {
      example.parent_description = this;
      this.examples.push(example);
    })

    def('add_before', function(fn) {
      this.befores.push(fn);
    })

    def('add_after', function(fn) {
      this.afters.push(fn);
    })

    def('run', function() {
      var run_it = function() {
        this.run()
      };
      Screw.each(this.examples, run_it);
      Screw.each(this.child_descriptions, run_it);
    });

    def('run_befores', function() {
      if (this.parent_description) {
        this.parent_description.run_befores();
      }

      Screw.each(this.befores, function() {
        this();
      });
    });

    def('run_afters', function() {
      Screw.each(this.afters, function() {
        this();
      });

      if (this.parent_description) {
        this.parent_description.run_afters();
      }
    });
  });

  constructor("Example", function() {
    def('initialize', function(name, fn) {
      this.name = name;
      this.fn = fn;
      this.fail_subscription_node = new Screw.SubscriptionNode();
      this.pass_subscription_node = new Screw.SubscriptionNode();
    });

    def('run', function() {
      try {
        try {
          this.parent_description.run_befores();
          this.fn()
        } finally {
          this.parent_description.run_afters();
        }
        this.pass_subscription_node.publish();
      } catch(e) {
        this.fail_subscription_node.publish(e);
      }
    });

    def('on_fail', function(callback) {
      this.fail_subscription_node.subscribe(callback);
    })

    def('on_pass', function(callback) {
      this.pass_subscription_node.subscribe(callback);
    })
  });

  constructor("SubscriptionNode", function() {
    def('initialize', function() {
      this.callbacks = [];
    })

    def('subscribe', function(callback) {
      this.callbacks.push(callback);
    })

    def('publish', function() {
      var args = arguments;
      Screw.each(this.callbacks, function() {
        this.apply(this, args);
      })
    })
  })
}});
