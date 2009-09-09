module("Screw", function(c) { with (c) {
  constructor("Description", function() {
    include(Screw.RunnableMethods);

    def('initialize', function(name) {
      this.name = name;
      this.children = [];
      this.child_descriptions = [];
      this.examples = [];
      this.inits = [];
      this.befores = [];
      this.afters = [];
      this.example_completed_subscription_node = new Screw.SubscriptionNode();
      this.has_scenario = false;
    });

    def('clone', function() {
      var clone = Screw.$.extend(new Screw.Description(), this);
      clone.example_completed_subscription_node = new Screw.SubscriptionNode();
      clone.children = [];
      clone.child_descriptions = [];
      clone.examples = [];
      
      Screw.each(this.children, function() {
        var child_clone = this.clone();
        if (child_clone.constructor == Screw.Description) {
          clone.add_description(child_clone);
        } else {
          clone.add_example(child_clone);
        }
      });

      return clone; 
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

    def('failure_messages', function() {
      var messages = [];
      Screw.each(this.failed_examples(), function() {
        messages.push(this.failure_message);
      });
      return messages;
    });

    def('runnable_at_path', function(path) {
      var current_runnable = this;
      Screw.each(path, function() {
        current_runnable = current_runnable.children[this];
      });
      return current_runnable;
    })

    def('add_description', function(description) {
      if (this.has_scenarios) {
        this.add_description_to_scenarios(description);
      } else {
        this.add_child_description_or_scenario(description)
      }
    });

    def('add_description_to_scenarios', function(description) {
      this.scenario_child_descriptions.push(description);
      Screw.each(this.child_descriptions, function() {
        this.add_description(description.clone());
      });
    });

    def('add_scenario', function(scenario_description) {
      if (!this.has_scenarios) {
        this.scenario_examples = this.examples;
        this.scenario_child_descriptions = this.child_descriptions;
        this.children = [];
        this.child_descriptions = [];
        this.examples = [];
        this.has_scenarios = true;
      }

      Screw.each(this.scenario_examples, function() {
        scenario_description.add_example(this.clone());
      });
      Screw.each(this.scenario_child_descriptions, function() {
        scenario_description.add_description(this.clone());
      });
      
      this.add_child_description_or_scenario(scenario_description);
    });

    def('add_child_description_or_scenario', function(description) {
      var self = this;
      description.parent_description = this;
      description.index = this.children.length;
      this.children.push(description);
      this.child_descriptions.push(description);
      description.on_example_completed(function(example) {
        self.example_completed_subscription_node.publish(example);
      });
    });

    def('add_example', function(example) {
      if (this.has_scenarios) {
        this.add_example_to_scenarios(example);
      } else {
        var self = this;
        example.parent_description = this;
        example.index = this.children.length;
        this.children.push(example);
        this.examples.push(example);

        example.on_example_completed(function(example) {
          self.example_completed_subscription_node.publish(example);
        });
      }
    });

    def('add_example_to_scenarios', function(example) {
      this.scenario_examples.push(example);
      Screw.each(this.child_descriptions, function() {
        this.add_example(example.clone());
      });
    });

    def('add_init', function(fn) {
      this.inits.push(fn);
    });

    def('add_before', function(fn) {
      this.befores.push(fn);
    });

    def('add_after', function(fn) {
      this.afters.push(fn);
    });

    def('enqueue', function() {
      var enqueue_it = function() {
        this.enqueue()
      };
      Screw.each(this.examples, enqueue_it);
      Screw.each(this.child_descriptions, enqueue_it);
    });

    def('run', function() {
      var run_it = function() {
        this.run()
      };
      Screw.each(this.examples, run_it);
      Screw.each(this.child_descriptions, run_it);
    });

    def('run_inits', function(example_context) {
      if (this.parent_description) {
        this.parent_description.run_inits(example_context);
      }

      Screw.each(this.inits, function() {
        this.call(example_context);
      });
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
}});
