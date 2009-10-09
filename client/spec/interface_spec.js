Screw.Unit(function(c) { with(c) {
  var original_prefs_data, original_options;

  describe("Screw.Interface", function() {
    describe(".refresh", function() {
      it("calls Screw.Interface.set_location with the current location", function() {
        mock(Screw.Interface, 'set_location');
        var expected_base_location = window.location.href.split('?')[0];

        Screw.Interface.refresh();

        var actual_location = Screw.Interface.set_location.most_recent_args[0];
        expect(actual_location).to(match, expected_base_location);
      });
    });
  });
}});
