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
  });
}});

Screw.$(function() {
  Screw.Interface.load_preferences();

  var root_description = Screw.root_description();

  // TODO: refactor
  var completed_example_count = 0;
  var total_example_count = root_description.total_examples();
  root_description.on_example_completed(function() {
    completed_example_count++;
    if (completed_example_count == total_example_count) {
      var outcome = (root_description.failed_examples().length == 0) ? "success" : "failure";
      Screw.$.ajax({ type: 'POST', url: '/complete', data: outcome });
    }
  });

  var runner = Screw.Disco.build(Screw.Interface.Runner, {root: root_description});
  setTimeout(function() {
    Screw.$('body').html(runner);
    runner.enqueue();
  }, 0);
});