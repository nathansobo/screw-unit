module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('Runner', {
      content: function(b) { with (b) {
        div(function() {
          subview('progress_bar', Screw.Interface.ProgressBar);
          ul({'class': 'descriptions'}, function() {
            Screw.each(Screw.global_description().child_descriptions, function() {
              keyed_subview('descriptions', this.name, Screw.Interface.Description, {description: this});
            });
          });
        }); 
      }},

      methods: {
        after_initialize: function() {
          Screw.focused_description().run();
        }
      }
    });

    def('ProgressBar', {
      content: function(b) { with(b) {
        div({'class': 'progress_bar'}, function() {
          div("", {'class': 'progress'});
        });
      }},

      methods: {
        after_initialize: function() {
          var self = this;
          var total_examples = Screw.focused_description().total_examples();
          var completed_examples = 0;
          Screw.global_description().on_example_completed(function(example) {
            completed_examples++;
            self.find('div.progress').css("width", (completed_examples / total_examples * 100).toString() + "%");
          });
        }
      }
    });

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
                keyed_subview('examples', this.name, Screw.Interface.Example, {example: this});
              })
            });
          }
          if (description.child_descriptions.length > 0) {
            ul({'class': 'child_descriptions'}, function() {
              Screw.each(description.child_descriptions, function() {
                keyed_subview('child_descriptions', this.name, Screw.Interface.Description, {description: this});
              })
            });
          }
        });
      }},

      methods: {
        focus: function() {
          Screw.refresh({
            focus_path: this.description.focus_path()
          });
        }
      }
    });

    def('Example', {
      content: function(b, initial_attributes) { with(b) {
        li({'class': 'example'}, function() {
          span(initial_attributes.example.name, {'class': 'name'}); 
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
            self.append("<div>" + e.message + "</div>");
            self.append("<pre>" + e.stack + "</pre>");
          })
        }
      }
    });
  });
}});

$(function() {
  $('body').html(Disco.build(Screw.Interface.Runner));
});