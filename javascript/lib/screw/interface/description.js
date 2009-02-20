module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('Description', {
      content: function(b, initial_attributes) { with (b) {
        var description = initial_attributes.description;
        li({'class': 'description'}, function() {
          span({'class': 'name'}, description.name).click(function(e, view) {
            view.focus();
          });

          if (description.examples.length > 0) {
            ul({'class': 'examples'}, function() {
              Screw.each(description.examples, function() {
                keyed_subview('examples', this.index, Screw.Interface.Example, {example: this});
              })
            });
          }
          if (description.child_descriptions.length > 0) {
            ul({'class': 'child_descriptions'}, function() {
              Screw.each(description.child_descriptions, function() {
                keyed_subview('child_descriptions', this.index, Screw.Interface.Description, {description: this});
              })
            });
          }
        });
      }},

      methods: {
        after_initialize: function() {

          if (Prefs.data.show == "failed") {
            this.hide();
          }

          var self = this;
          this.description.on_example_completed(function(example) {
            if (example.failed) {
              self.addClass('failed')
            } else {
              self.addClass('passed');
            }
          })
        },

        focus: function() {
          Prefs.data.run_paths = [this.description.path()];
          Prefs.save();
          Screw.Interface.refresh();
        }
      }
    });
  });
}});
