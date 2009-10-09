(function(Screw, Monarch, Prefs) {

Monarch.constructor("Screw.Interface.Runner", Monarch.View.Template, {
  content: function(initial_attributes) { with (this.builder) {
    div({'id': "screw_unit_runner"}, function() {
      table({'id': "screw_unit_header"}, function() {
        tbody(function() {
          tr(function() {
            td({'id': "screw_unit_controls"}, function() {
              button({'id': "show_all"}, "Show All").click(function(view) {
                view.show_all();
              });
              button({'id': "show_failed"}, "Show Failed").click(function(view) {
                view.show_failed();
              });
              button({'id': "rerun_all"}, "Rerun All").click(function(view) {
                view.rerun_all();
              });
              button({'id': "rerun_failed"}, "Rerun Failed").click(function(view) {
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

  view_properties: {
    initialize: function() {
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
      var self = this;
      this.completed_example_count = 0;
      this.total_examples = Screw.root_description().total_examples();

      var queue = new Monarch.Queue();

      Screw.root_description().on_example_completed(function() { self.update() } );
      Monarch.Util.each(Screw.Interface.examples_to_run(), function(example) {
        queue.add(function() {
          example.run();
        })
      });

      queue.start();
    },

    update: function() {
      this.completed_example_count++;
          
      if (this.completed_example_count == this.total_examples) {
        var is_success = (Screw.root_description().failed_examples().length == 0);
        Screw.$("ul.descriptions").addClass(is_success ? "passed" : "failed");
      }
    }
  }
});

})(Screw, Monarch, Prefs);
