module("Screw", function(c) { with(c) {
  module("Interface", function() {
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

          div({'id': 'test_content'});

          ul({'class': 'descriptions'}, function() {
            subview('root_description', Screw.Interface.Description, {description: initial_attributes.root, build_immediately: initial_attributes.build_immediately});
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

        enqueue: function() {
          Screw.each(Screw.Interface.examples_to_run(), function() {
            this.enqueue();
          });
        }
      }
    });
  });
}});
