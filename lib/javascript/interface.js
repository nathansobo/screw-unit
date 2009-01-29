module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('load_preferences', function() {
      Prefs.load();
      if (!Prefs.data.show) {
        Prefs.data.show = "all";
      }
    });
    
    def('refresh', function() {
      this.set_location(this.get_location());
    });

    def('set_location', function(location) {
      window.location = location;
    });

    def('get_location', function() {
      return window.location.toString();
    });

    def('examples_to_run', function() {
      if (Prefs.data.run_paths) {
        return Screw.map(Prefs.data.run_paths, function() {
          return Screw.root_description().runnable_at_path(this);
        })
      } else {
        return [Screw.root_description()];
      }
    });
    
    def('Runner', {
      content: function(b, initial_attributes) { with (b) {
        div({'id': "screw_unit_runner"}, function() {
          table({'id': "screw_unit_header"}, function() {
            tbody(function() {
              tr(function() {
                td({'id': "screw_unit_controls"}, function() {
                  button({'id': "show_all"}, "Show All").click(function(e, view) {
                    view.show_all();
                  });
                  button({'id': "show_failed"}, "Show Failed").click(function(e, view) {
                    view.show_failed();
                  });
                  button({'id': "rerun_all"}, "Rerun All").click(function(e, view) {
                    view.rerun_all();
                  });
                  button({'id': "rerun_failed"}, "Rerun Failed").click(function(e, view) {
                    view.rerun_failed();
                  });
                });
                td(function() {
                  subview('progress_bar', Screw.Interface.ProgressBar, {examples_to_run: Screw.Interface.examples_to_run()});
                });
              })
            })
          });

          ul({'class': 'descriptions'}, function() {
            subview('root_description', Screw.Interface.Description, {description: initial_attributes.root});
          });
        });
      }},

      methods: {
        after_initialize: function() {
          if (Prefs.data.show == "all") this.addClass("show_all");
          if (Prefs.data.show == "failed") this.addClass("show_failed");
        },

        show_failed: function() {
          Prefs.data.show = "failed";
          Prefs.save();
          this.addClass('show_failed');
          this.removeClass('show_all');
        },

        show_all: function() {
          Prefs.data.show = "all";
          Prefs.save();
          this.addClass('show_all');
          this.removeClass('show_failed');
        },

        rerun_failed: function() {
          Prefs.data.run_paths = Screw.map(this.root.failed_examples(), function() {
            return this.path();
          });
          Prefs.save();
          Screw.Interface.refresh();
        },

        rerun_all: function() {
          Prefs.data.run_paths = null;
          Prefs.save();
          Screw.Interface.refresh();
        },

        run: function() {
          Screw.each(Screw.Interface.examples_to_run(), function() {
            this.run();
          });
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
          var self = this;
          this.total_examples = 0;
          Screw.each(this.examples_to_run, function() {
            self.total_examples += this.total_examples();
            this.on_example_completed(function(example) {
              self.update_progress(example);
            });
          });


          this.completed_examples = 0;
          this.failed_examples = 0;

          this.progress_div = this.find('div#screw_unit_progress');
          this.progress_text_div = this.find('div#screw_unit_progress_text');
          
          this.resize_progress_div();
          this.refresh_progress_text();
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

$(function() {
  Screw.Interface.load_preferences();
  var runner = Disco.build(Screw.Interface.Runner, {root: Screw.root_description()})
  $('body').html(runner);
  runner.run();
});