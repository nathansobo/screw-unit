(function(Screw, Monarch) {

Monarch.module("Screw.RunnableMethods", {
  path: function() {
    if (!this.parent_description) {
      return [];
    }
    return this.parent_description.path().concat([this.index]);
  },

  on_example_completed: function(callback) {
    this.example_completed_subscription_node.subscribe(callback);
  }
});

})(Screw, Monarch);

