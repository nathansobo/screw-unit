//= require "interface/description"
//= require "interface/example"
//= require "interface/progress_bar"
//= require "interface/runner"
//= require "interface/streaming_runner"

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

})(Screw, Monarch, jQuery, Prefs);
