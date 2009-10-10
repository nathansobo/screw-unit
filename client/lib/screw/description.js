(function(Screw, Monarch) {

Monarch.constructor("Screw.Description", Screw.RunnableMethods, {
  initialize: function(name) {
    this.name = name;
    this.children = [];
    this.child_descriptions = [];
    this.examples = [];
    this.inits = [];
    this.befores = [];
    this.afters = [];
    this.child_subscriptions = new Monarch.SubscriptionBundle();
    this.example_completed_subscription_node = new Monarch.SubscriptionNode();
    this.has_scenario = false;
  },

  clone: function() {
    var clone = Screw.$.extend(new Screw.Description(), this);
    clone.example_completed_subscription_node = new Monarch.SubscriptionNode();
    clone.child_subscriptions = new Monarch.SubscriptionBundle();
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
  },

  clear_children: function() {
    this.child_subscriptions.destroy_all();
    this.children = [];
    this.child_descriptions = [];
    this.examples = [];
  },

  total_examples: function() {
    var total_examples = this.examples.length;
    Screw.each(this.child_descriptions, function() {
      total_examples += this.total_examples();
    })
    return total_examples;
  },

  failed_examples: function() {
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
  },

  failure_messages: function() {
    var messages = [];
    Screw.each(this.failed_examples(), function() {
      messages.push(this.failure_message);
    });
    return messages;
  },

  runnable_at_path: function(path) {
    var current_runnable = this;
    Screw.each(path, function() {
      current_runnable = current_runnable.children[this];
    });
    return current_runnable;
  },

  add_description: function(description) {
    if (this.has_scenarios) {
      this.add_description_to_scenarios(description);
    } else {
      this.add_child_description_or_scenario(description)
    }
  },

  add_description_to_scenarios: function(description) {
    this.scenario_child_descriptions.push(description);
    Screw.each(this.child_descriptions, function() {
      this.add_description(description.clone());
    });
  },

  add_scenario: function(scenario_description) {
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
  },

  add_child_description_or_scenario: function(description) {
    var self = this;
    description.parent_description = this;
    description.index = this.children.length;
    this.children.push(description);
    this.child_descriptions.push(description);

    this.child_subscriptions.add(description.on_example_completed(function(example) {
      self.example_completed_subscription_node.publish(example);
    }));
  },

  add_example: function(example) {
    if (this.has_scenarios) {
      this.add_example_to_scenarios(example);
    } else {
      var self = this;
      example.parent_description = this;
      example.index = this.children.length;
      this.children.push(example);
      this.examples.push(example);

      this.child_subscriptions.add(example.on_example_completed(function(example) {
        self.example_completed_subscription_node.publish(example);
      }));
    }
  },

  add_example_to_scenarios: function(example) {
    this.scenario_examples.push(example);
    Screw.each(this.child_descriptions, function() {
      this.add_example(example.clone());
    });
  },

  add_init: function(fn) {
    this.inits.push(fn);
  },

  add_before: function(fn) {
    this.befores.push(fn);
  },

  add_after: function(fn) {
    this.afters.push(fn);
  },

  run: function() {
    var queue = new Monarch.Queue();
    Monarch.Util.each(this.examples, function(example) {
      queue.add(function() {
        example.run();
      })
    });

    Monarch.Util.each(this.child_descriptions, function(description) {
       queue.add(function() {
         description.run();
       });
    });
    
    queue.start();
  },

  run_inits: function(example_context) {
    if (this.parent_description) {
      this.parent_description.run_inits(example_context);
    }

    Screw.each(this.inits, function() {
      this.call(example_context);
    });
  },

  run_befores: function(example_context) {
    if (this.parent_description) {
      this.parent_description.run_befores(example_context);
    }

    Screw.each(this.befores, function() {
      this.call(example_context);
    });
  },

  run_afters: function(example_context) {
    Screw.each(this.afters, function() {
      this.call(example_context);
    });

    if (this.parent_description) {
      this.parent_description.run_afters(example_context);
    }
  },


  full_name: function() {
    if (this.parent_description) {
      return this.parent_description.full_name() + this.name + " :: ";
    } else {
      return "";
    }
  }

});

})(Screw, Monarch);
