module("Screw", function(c) { with (c) {
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
