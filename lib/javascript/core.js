module("Screw", function(c) { with (c) {
  def('Unit', function(specification) {
    specification(new Screw.Context());
  });
  
  def('focused_description', function() {
    var focus_path = this.focus_path();
    
    if (focus_path) {
      var focused_entity = this.global_description();
      Screw.each(focus_path, function() {
        focused_entity = focused_entity.children[this];
      });
      return focused_entity;
    } else {
      return this.global_description();
    }
  });

  def('focus_path', function() {
    var focus_string = decodeURI(window.location.search).substr(1)
    return focus_string ? focus_string.split('/') : null;
  });

  def('global_description', function() {
    return this._global_description = this._global_description || new Screw.Description("");
  });

  def('refresh', function(options) {
    window.location = window.location.href.split('?')[0] + '?' + options.focus_path;
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

  module("RunnableMethods", function() {
    def('focus_path', function() {
      console.debug(this.parent_description);
      
      if (!this.parent_description) return null;
      var parent_focus_path = this.parent_description.focus_path();
      return parent_focus_path  ? parent_focus_path + "/" + this.index.toString() : this.index.toString();
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

    def('on_example_completed', function(callback) {
      this.example_completed_subscription_node.subscribe(callback);
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
      example.on_pass(function() {
        self.example_completed_subscription_node.publish(example);
      })
      example.on_fail(function() {
        self.example_completed_subscription_node.publish(example);
      })
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
    include(Screw.RunnableMethods);
    
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
