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
  var runner = Disco.build(Screw.Interface.Runner, {root: Screw.root_description()})
  Screw.$('body').html(runner);
  runner.run();
});