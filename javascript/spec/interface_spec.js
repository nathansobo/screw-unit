Screw.Unit(function(c) { with(c) {
  var original_prefs_data, original_options;

  before(function() {
    original_prefs_data = Screw.$.extend({}, Prefs.data);
    Prefs.data.show = 'all';
    original_options = Screw.Interface.options;
    Screw.Interface.options = {}
  });

  after(function() {
    Prefs.data = original_prefs_data;
    Prefs.save();
    Screw.Interface.options = original_options;
  });

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

    describe(".load_preferences", function() {
      var original_prefs_data;

      before(function() {
        Prefs.data = { foo: "bar" }
        Prefs.save();
        Prefs.data = null;
      });

      it("loads the Prefs from the cookie", function() {
        expect(Prefs.data).to(be_null);
        Screw.Interface.load_preferences();
        expect(Prefs.data.foo).to(equal, "bar");
      });

      it("defaults 'show' to all if it is not specified in the cookie", function() {
        Screw.Interface.load_preferences();
        expect(Prefs.data.show).to(equal, "all");
      });
    });

    describe(".examples_to_run", function() {
      context("when Prefs.data.run_paths is undefined", function() {
        before(function() {
          Prefs.data.run_paths = undefined;
        });

        it("returns the [Screw.root_description()]", function() {
          expect(Screw.Interface.examples_to_run()).to(equal, [Screw.root_description()]);
        });
      });

      context("when Prefs.data.run_paths contains paths", function() {
        it("returns the result of root.runnable_at_path for that path", function() {
          var root_description = Screw.root_description();
          Prefs.data.run_paths = [[1,2,3], [4, 5, 6]];

          var i = 0;
          var return_vals = ['x', 'y'];

          mock(root_description, 'runnable_at_path', function() {
            return return_vals[i++];
          });

          expect(Screw.Interface.examples_to_run()).to(equal, return_vals);
          expect(Screw.root_description().runnable_at_path.call_args[0][0]).to(equal, [1,2,3]);
          expect(Screw.root_description().runnable_at_path.call_args[1][0]).to(equal, [4,5,6]);
        });
      });
    });
  });
}});