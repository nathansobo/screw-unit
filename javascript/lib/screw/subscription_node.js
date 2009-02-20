module("Screw", function(c) { with (c) {
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