//= require "interface/description"
//= require "interface/example"
//= require "interface/progress_bar"
//= require "interface/runner"

(function(Screw, Monarch, jQuery, Prefs) {

Monarch.module("Screw.Interface", {
  load_preferences: function() {
    Prefs.load();
    if (!Prefs.data.show) {
      Prefs.data.show = "all";
    }
  },

  refresh: function() {
    this.set_location(this.get_location());
  },

  set_location: function(location) {
    window.location = location;
  },

  get_location: function() {
    return window.location.toString();
  },

  examples_to_run: function() {
    if (Prefs.data.run_paths) {
      return Screw.map(Prefs.data.run_paths, function() {
        return Screw.root_description().runnable_at_path(this);
      })
    } else {
      return [Screw.root_description()];
    }
  }
});

jQuery(function() {
  Screw.Interface.load_preferences();

  var root_description = Screw.root_description();
  var completed_example_count = 0;
  var total_example_count = root_description.total_examples();
  root_description.on_example_completed(function() {
    completed_example_count++;
    if (completed_example_count == total_example_count) {
      var outcome = (root_description.failed_examples().length == 0) ? "success" : root_description.failure_messages().join("\n");
      Screw.$.ajax({ type: 'POST', url: '/complete', data: outcome });
    }
  });


  var queue = new Monarch.Queue();

  var runner;
  queue.add(function() {
    runner = Screw.Interface.Runner.to_view({root: root_description});
  });
  queue.add(function() {
    Screw.$('body').html(runner);
  });
  queue.add(function() {
    runner.enqueue();
  })
  queue.start();
});

})(Screw, Monarch, jQuery, Prefs);
