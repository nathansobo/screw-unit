module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('options', {});

    def('parse_options', function() {
      var options_string = this.get_location().split("?")[1];
      if (options_string) {
        Screw.each(options_string.split('&'), function() {
          var pair = this.split("=");
          Screw.Interface.options[pair[0]] = pair[1];
        });
      }
    });

    def('load_preferences', function() {
      Prefs.load();
      if (!Prefs.data.show) {
        Prefs.data.show = "all";
      }
    });
    
    def('refresh', function() {
      var option_pairs = [];
      for(var option_name in Screw.Interface.options) {
        option_pairs.push(option_name + "=" + Screw.Interface.options[option_name]);
      }
      var current_location = window.location.href.split('?')[0];
      var options = (option_pairs.length == 0) ? "" : "?" + option_pairs.join('&');
      this.set_location(current_location + options);
    });

    def('set_location', function(location) {
      window.location = location;
    });

    def('get_location', function() {
      return window.location.toString();
    });

    def('focused_runnable', function() {
      if (Screw.Interface.options.focus_path) {
        var focus_path = Screw.Interface.options.focus_path.split(',');
        return Screw.global_description().runnable_at_path(focus_path);
      } else {
        return Screw.global_description();
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
                });
                td(function() {
                  subview('progress_bar', Screw.Interface.ProgressBar, initial_attributes);
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
          this.runnable.run();
        },

        show_failed: function() {
          Prefs.data.show = "failed";
          Prefs.save();
          this.find(".example").hide();
          this.find(".description").hide();
          this.find(".failed").show();
        },

        show_all: function() {
          Prefs.data.show = "all";
          Prefs.save();
          this.find(".example").show();
          this.find(".description").show();
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
        after_initialize: function() {
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
          Screw.Interface.options.focus_path = this.description.path();
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
          Screw.Interface.options.focus_path = this.example.path();
          Screw.Interface.refresh();
        }
      }
    });
  });
}});

$(function() {
  Screw.Interface.parse_options();
  Screw.Interface.load_preferences();
  $('body').html(Disco.build(Screw.Interface.Runner, {root: Screw.global_description(), runnable: Screw.Interface.focused_runnable()}));
});