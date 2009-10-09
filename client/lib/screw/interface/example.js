(function(Screw, Monarch) {

Monarch.constructor("Screw.Interface.Example", Monarch.View.Template, {
  content: function(initial_attributes) { with(this.builder) {
    li({'class': 'example'}, function() {
      span(initial_attributes.example.name, {'class': 'name'}).click(function(view) {
        view.focus();
      });
    });
  }},

  view_properties: {
    initialize: function() {
      var self = this;
      this.example.on_pass(function() {
        self.addClass("passed");
      })
      this.example.on_fail(function(e) {
        self.addClass("failed");

        var message = Screw.$("<div class='failure_message'/>");
        message.text(e.message);

        var trace = Screw.$("<pre class='failure_trace'/>");
        if (e.stack) {
          var enhanced_stack = e.stack.replace(/http:\/\/(.*_spec)\.js/g, '<a href="http://$1" target="_blank">http://$1.js</a>')
          trace.html(enhanced_stack);
        }

        self.append(message);
        self.append(trace);
      });
    },

    focus: function() {
      throw new Error("Not implemented yet");
    }
  }
});

})(Screw, Monarch);
