module("Screw", function(c) { with (c) {
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
}});
