module("Screw", function(c) { with (c) {
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
      var run_async = (function(self) {
        return function() {
          try {
            try {
              var example_context = {};
              self.parent_description.run_befores(example_context);
              self.fn.call(example_context);
            } finally {
              self.parent_description.run_afters(example_context);
              Screw.reset_mocks();
            }
            self.passed = true;
            self.pass_subscription_node.publish();
            self.example_completed_subscription_node.publish(self);
          } catch(e) {
            self.failed = true;
            self.fail_subscription_node.publish(e);
            self.example_completed_subscription_node.publish(self);
          }
        };
      })(this);

      setTimeout(run_async, 0);
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
}});