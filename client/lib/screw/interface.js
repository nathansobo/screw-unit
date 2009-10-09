//= require "interface/description"
//= require "interface/example"
//= require "interface/progress_bar"
//= require "interface/runner"
//= require "interface/streaming_runner"

(function(Screw, Monarch, jQuery) {

Monarch.module("Screw.Interface", {
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
    // TODO: Add handling for this
    return [Screw.root_description()];
  }
});

})(Screw, Monarch, jQuery);
