module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('Runner', {
      content: function(b, initial_attributes) { with (b) {
        div({'id': "screw_unit_runner"}, function() {
          table({'id': "screw_unit_header"}, function() {
            tbody(function() {
              tr(function() {
                td({'id': "screw_unit_controls"}, function() {
                  button("Show All");
                  button("Show Failing");
                });
                td(function() {
                  subview('progress_bar', Screw.Interface.ProgressBar, initial_attributes);
                });
              })
            })
          });

          ul({'class': 'descriptions'}, function() {
            Screw.each(initial_attributes.root.child_descriptions, function() {
              keyed_subview('descriptions', this.index, Screw.Interface.Description, {description: this});
            });
          });
        });
      }},

      methods: {
        after_initialize: function() {
          this.runnable.run();
        }
      }
    });

    def('ProgressBar', {
      content: function(b, initial_attributes) { with(b) {
        div({'id': 'screw_unit_progress_bar'}, function() {
          div({'id': 'screw_unit_progress'});
          div({'id': 'screw_unit_progress_text'});
        });
      }},

      methods: {
        after_initialize: function() {
          this.total_examples = this.runnable.total_examples();
          this.completed_examples = 0;
          this.failed_examples = 0;

          this.progress_div = this.find('div#screw_unit_progress');
          this.progress_text_div = this.find('div#screw_unit_progress_text');
          
          this.resize_progress_div();
          this.refresh_progress_text();

          var self = this;
          this.runnable.on_example_completed(function(example) {
            self.update_progress(example);
          });
        },

        update_progress: function(example) {
          this.completed_examples++;
          if (example.failed) {
            this.failed_examples++;
            this.addClass('failed');
          }

          this.resize_progress_div();
          this.refresh_progress_text();
        },

        resize_progress_div: function() {
          this.progress_div.css("width", (this.completed_examples / this.total_examples * 100).toString() + "%");
        },

        refresh_progress_text: function() {
          this.progress_text_div.html(this.completed_examples + " of " + this.total_examples + " completed. " + this.failed_examples + " failed.");
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
        focus: function() {
          this.description.focus();
        }
      }
    });

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
            console.debug(e);
            
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
          this.example.focus();
        }
      }
    });
  });
}});

$(function() {
  $('body').html(Disco.build(Screw.Interface.Runner, {root: Screw.global_description(), runnable: Screw.focused_runnable()}));
});