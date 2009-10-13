Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.ProgressBar", function() {
    var description_1, description_2, example_1, example_2, example_3, example_4, view, should_fail;
    before(function() {
      should_fail = false;
      description_1 = new Screw.Description("description");
      example_1 = new Screw.Example("example 1", function() {
        if (should_fail) throw "flunk";
      });
      example_2 = new Screw.Example("example 1", function() {
        if (should_fail) throw "flunk";
      });
      description_1.add_example(example_1);
      description_1.add_example(example_2);

      description_2 = new Screw.Description("description");
      example_3 = new Screw.Example("example 3", function() {
        if (should_fail) throw "flunk";
      });
      example_4 = new Screw.Example("example 4", function() {
        if (should_fail) throw "flunk";
      });
      description_2.add_example(example_3);
      description_2.add_example(example_4);

      root = new Screw.Description('root');
      root.add_description(description_1);
      root.add_description(description_2);

      view = Screw.Interface.ProgressBar.to_view({root: root});
    });

    describe("when an example within the given root is completed", function() {
      it("updates the width of the progress bar to the proportion of completed examples and updates the 'n of m completed' text", function() {
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '0%');
        expect(view.html()).to(match, "0 of 4");
        example_1.run();
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '25%');
        expect(view.html()).to(match, "1 of 4");
        example_2.run();
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '50%');
        expect(view.html()).to(match, "2 of 4");
      });
    });

    describe("when an example within the given root fails", function() {
      before(function() {
        should_fail = true;
      });

      it("adds the 'failed' class to its content", function() {
        expect(view.hasClass('failed')).to(be_false);
        example_1.run();
        expect(view.hasClass('failed')).to(be_true);
      });

      it("updates the 'n failed' text to the number of failing examples", function() {
        expect(view.html()).to(match, "0 failed");
        example_1.run();
        expect(view.html()).to(match, "1 failed");
        example_2.run();
        expect(view.html()).to(match, "2 failed");
      });
    });
  });
}});
