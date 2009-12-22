(function(Screw, Monarch) {

Monarch.constructor("Screw.Example", Screw.RunnableMethods, {
  initialize: function(name, fn) {
    this.name = name;
    this.fn = fn;
    this.fail_subscription_node = new Monarch.SubscriptionNode();
    this.pass_subscription_node = new Monarch.SubscriptionNode();
    this.example_completed_subscription_node = new Monarch.SubscriptionNode();
    this.passed = false;
    this.failed = false;
    this.failure_message = null;
  },

  clone: function() {
    var clone = Screw.$.extend(new Screw.Example(), this);
    clone.initialize(this.name, this.fn);
    return clone;
  },
  
  add_to_queue: function(queue) {
    var self = this;
    queue.add(function() {
      self.run();
    });
  },

  run: function() {
    try {
      try {
        var example_context = {};
        this.parent_description.run_inits(example_context);
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

      if (!e.stack) {
        e.stack = e.message + " (" + e.sourceURL + ":" + e.line + ")";
      }

      this.failure_message = e.message;
      this.stack = e.stack;
      this.fail_subscription_node.publish(e);
      this.example_completed_subscription_node.publish(this);
    }
  },

  on_fail: function(callback) {
    this.fail_subscription_node.subscribe(callback);
  },

  on_pass: function(callback) {
    this.pass_subscription_node.subscribe(callback);
  },

  total_examples: function() {
    return 1;
  },

  full_name: function() {
    return this.parent_description.full_name() + this.name;
  }
});

})(Screw, Monarch);
