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

  enqueue: function() {
    var self = this;
    setTimeout(function() { self.run(); }, 0);
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
      this.failure_message = "Failure in '" + this.name + "':\n" + e.stack;
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
  }
});

})(Screw, Monarch);
