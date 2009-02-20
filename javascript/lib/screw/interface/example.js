module("Screw", function(c) { with(c) {
  module("Interface", function() {

    def('Example', {
      content: function(b, initial_attributes) { with(b) {
        li({'class': 'example'}, function() {
          span(initial_attributes.example.name, {'class': 'name'}).click(function(e, view) {
            view.focus();
          });
        });
      }},

      methods: {
        after_initialize: function() {
          var self = this;
          this.example.on_pass(function() {
            self.addClass("passed");
          })
          this.example.on_fail(function(e) {
            self.addClass("failed");

            var message = $("<div class='failure_message'/>");
            message.text(e.message);

            var trace = $("<pre class='failure_trace'/>");
            trace.text(e.stack);

            self.append(message);
            self.append(trace);
          });
        },

        focus: function() {
          Prefs.data.run_paths = [this.example.path()];
          Prefs.save();
          Screw.Interface.refresh();
        }
      }
    });
  });
}});
