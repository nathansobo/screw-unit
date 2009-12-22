(function(Screw, Monarch, jQuery) {

Monarch.constructor("Screw.Interface.Runner", Monarch.View.Template, {
  constructor_properties: {
    run_specs_on_page_load: function() {
      var self = this;
      jQuery(function() {
        var root_description = Screw.root_description();
        var queue = new Monarch.Queue();
        var runner;
        queue.add(function() {
          var show = jQuery.cookie("__screw_unit__show") || "all";
          runner = Screw.Interface.Runner.to_view({root: Screw.root_description(), show: show, post_on_completion: true});
        });
        queue.add(function() {
          Screw.$('body').html(runner);
        });
        queue.add(function() {
          runner.run(self.run_paths());
        })
        queue.start();
      });
    },

    run_paths: function() {
      var after_hash = Screw.Interface.get_location().href.split("?")[1];
      if (after_hash) {
        return JSON.parse(after_hash);
      } else {
        return null;
      }
    }
  },

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
              subview('progress_bar', Screw.Interface.ProgressBar, {root: initial_attributes.root});
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
      if (this.show == "all") this.addClass('show_all');
      if (this.show == "failed") this.addClass("show_failed");
    },

    show_failed: function() {
      jQuery.cookie("__screw_unit__show", "failed", {path: "/"});
      this.addClass('show_failed');
      this.removeClass('show_all');
    },

    show_all: function() {
      jQuery.cookie("__screw_unit__show", "all", {path: "/"});
      this.addClass('show_all');
      this.removeClass('show_failed');
    },

    rerun_failed: function() {
      var failing_paths = Monarch.Util.map(this.root.failed_examples(), function(example) { return example.path() });
      Screw.Interface.set_location(Screw.Interface.base_location() + '?' + JSON.stringify(failing_paths));
    },

    rerun_all: function() {
      Screw.Interface.set_location(Screw.Interface.base_location());
    },

    run: function(run_paths) {
      var self = this;
      var objects_to_run = this.determine_runnables_to_run(run_paths);
      this.completed_example_count = 0;
      this.total_examples = Screw.root_description().total_examples();

      var queue = new Monarch.Queue();
      this.root.on_example_completed(function() { self.example_completed() } );
      
      Monarch.Util.each(objects_to_run, function(runnable) {
        runnable.add_to_queue(queue);
      });

      queue.start();
    },

    determine_runnables_to_run: function(run_paths) {
      if (!run_paths) return [this.root];

      var self = this;
      var runnables_to_run = [];
      Monarch.Util.each(run_paths, function(path) {
        var runnable = self.root.runnable_at_path(path);
        if (runnable) {
          runnables_to_run.push(runnable);
        } else {
          throw new Error("No runnable at path " + path);
        }
      });
      return runnables_to_run;
    },

    example_completed: function() {
      this.completed_example_count++;
      if (this.completed_example_count == this.total_examples) this.all_examples_completed();
    },

    all_examples_completed: function() {
      var is_success = (Screw.root_description().failed_examples().length == 0);
      this.find("ul.descriptions").addClass(is_success ? "passed" : "failed");
      if (this.post_on_completion) {
        var outcome = (is_success) ? "success" : this.root.failure_messages().join("\n");
        Screw.jQuery.ajax({ type: 'POST', url: '/complete', data: outcome });
      }
    }
  }
});

})(Screw, Monarch, jQuery);
