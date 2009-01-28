module("Screw", function(c) { with (c) {
  def('Unit', function(specification) {
    specification(new Screw.Context());
  });
  
  def('root_description', function() {
    return this._root_description = this._root_description || new Screw.Description("All specs");
  });

  def('mocks', []);

  def('reset_mocks', function() {
    Screw.each(Screw.mocks, function() {
      this.mocked_object[this.function_name] = this.original_function;
    })
    Screw.mocks = [];
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
      this._description_stack = [this.root_description()];
    }
    return this._description_stack;
  });

  def('map', function(array, fn) {
    var results = [];
    Screw.each(array, function() {
      results.push(fn.call(this));
    });
    return results;
  })

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

    def('context', Screw.Keywords.describe);

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

    def('mock', function(object, method_name, method_mock) {
      if (!object[method_name]) {
        throw new Error("in mock_function: " + method_name + " is not a function that can be mocked");
      }
      
      var mock_wrapper = function() {
        mock_wrapper.call_count += 1;
        mock_wrapper.call_args.push(arguments);
        mock_wrapper.most_recent_args = arguments;

        if (method_mock) {
          return method_mock.apply(this, arguments);
        }
      };
      mock_wrapper.mocked_object = object;
      mock_wrapper.function_name = method_name;
      mock_wrapper.original_function = object[method_name];
      mock_wrapper.call_count = 0;
      mock_wrapper.call_args = [];
      mock_wrapper.most_recent_args = null;
      Screw.mocks.push(mock_wrapper);
      object[method_name] = mock_wrapper;

      return object;
    });
  });

  constructor("Context", function() {
    include(Screw.Matchers);
    include(Screw.Keywords);
  });
  
  module("RunnableMethods", function() {
    def('path', function() {
      if (!this.parent_description) {
        return [];
      }
      return this.parent_description.path().concat([this.index]);
    });

    def('on_example_completed', function(callback) {
      this.example_completed_subscription_node.subscribe(callback);
    });
  });
  
  constructor("Description", function() {
    include(Screw.RunnableMethods);
    
    def('initialize', function(name) {
      this.name = name;
      this.children = [];
      this.child_descriptions = [];
      this.examples = [];
      this.befores = [];
      this.afters = [];
      this.example_completed_subscription_node = new Screw.SubscriptionNode();
    });
    
    def('total_examples', function() {
      var total_examples = this.examples.length;
      Screw.each(this.child_descriptions, function() {
        total_examples += this.total_examples();
      })
      return total_examples;
    });

    def('failed_examples', function() {
      var failed_examples = [];
      Screw.each(this.examples, function() {
        if (this.failed) {
          failed_examples.push(this);
        }
      });
      Screw.each(this.child_descriptions, function() {
        failed_examples = failed_examples.concat(this.failed_examples());
      });
      return failed_examples;
    });

    def('runnable_at_path', function(path) {
      var current_runnable = this;
      Screw.each(path, function() {
        current_runnable = current_runnable.children[this];
      });
      return current_runnable;
    })
    
    def('add_description', function(description) {
      var self = this;
      description.parent_description = this;
      description.index = this.children.length;
      this.children.push(description);
      this.child_descriptions.push(description);
      description.on_example_completed(function(example) {
        self.example_completed_subscription_node.publish(example);
      })
    });

    def('add_example', function(example) {
      var self = this;
      example.parent_description = this;
      example.index = this.children.length;
      this.children.push(example);
      this.examples.push(example);
      
      example.on_example_completed(function(example) {
        self.example_completed_subscription_node.publish(example);
      });
    });

    def('add_before', function(fn) {
      this.befores.push(fn);
    });

    def('add_after', function(fn) {
      this.afters.push(fn);
    });

    def('run', function() {
      var run_it = function() {
        this.run()
      };
      Screw.each(this.examples, run_it);
      Screw.each(this.child_descriptions, run_it);
    });

    def('run_befores', function(example_context) {
      if (this.parent_description) {
        this.parent_description.run_befores(example_context);
      }

      Screw.each(this.befores, function() {
        this.call(example_context);
      });
    });

    def('run_afters', function(example_context) {
      Screw.each(this.afters, function() {
        this.call(example_context);
      });

      if (this.parent_description) {
        this.parent_description.run_afters(example_context);
      }
    });
  });

  constructor("Example", function() {
    include(Screw.RunnableMethods);
    
    def('initialize', function(name, fn) {
      this.name = name;
      this.fn = fn;
      this.fail_subscription_node = new Screw.SubscriptionNode();
      this.pass_subscription_node = new Screw.SubscriptionNode();
      this.example_completed_subscription_node = new Screw.SubscriptionNode();
      this.passed = false;
      this.failed = false;
    });

    def('run', function() {
      try {
        try {
          var example_context = {};
          this.parent_description.run_befores(example_context);
          this.fn.call(example_context);
        } finally {
          this.parent_description.run_afters(example_context);
          Screw.reset_mocks();
        }
        this.passed = true;
        this.pass_subscription_node.publish();
        this.example_completed_subscription_node.publish(this);
      } catch(e) {
        this.failed = true;
        this.fail_subscription_node.publish(e);
        this.example_completed_subscription_node.publish(this);
      }
    });

    def('on_fail', function(callback) {
      this.fail_subscription_node.subscribe(callback);
    });

    def('on_pass', function(callback) {
      this.pass_subscription_node.subscribe(callback);
    });

    def('total_examples', function() {
      return 1;
    });
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
