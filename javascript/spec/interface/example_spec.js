Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Example", function() {
    var example, description, view, failure_message, should_fail;
    before(function() {
      failure_message = "sharon ly says die!";
      example = new Screw.Example("passes or fails", function() {
        if (should_fail) throw(new Error(failure_message));
      });

      description = new Screw.Description("parent description");
      description.add_example(example);
      view = Screw.Disco.build(Screw.Interface.Example, {example: example, build_immediately: true});
    });

    describe("#content", function() {
      it("renders the associated Example's #name", function() {
        expect(view.html()).to(match, example.name);
      });
    });

    describe("when span.name is clicked", function() {
      it("calls #focus on the view", function() {
        mock(view, 'focus');
        view.find('span.name').click();
        expect(view.focus).to(have_been_called);
      });
    });

    describe("when its associated Example fails", function() {
      before(function() {
        should_fail = true;
      });

      it("applies the 'failed' class to its content", function() {
        expect(view.hasClass('failed')).to(be_false);
        example.run();
        expect(view.hasClass('failed')).to(be_true);
      });

      it("appends the failure message", function() {
        example.run();
        expect(view.html()).to(match, failure_message);
      });

      it("appends the stacktrace", function() {
        var stack;
        example.on_fail(function(e) {
          stack = e.stack;
        })
        example.run();
        stack_without_links = view.html().replace(/<a[^>]+>/g, "").replace(/<\/a>/g, "");
        expect(stack_without_links).to(match, stack);
      });

      it("includes links to spec files within the stack trace", function() {
        var stack;
        example.on_fail(function(e) {
          stack = e.stack;
        });
        example.run();

        var matches = stack.match(/(http:\/\/.*_spec).js/);
        expect(matches.length).to(be_gt, 1);
        expect(view.find("a[href="+matches[1]+"]")).to_not(be_empty);
      });
    });

    describe("when its associated Example passes", function() {
      before(function() {
        should_fail = false;
      });

      it("applies the 'passed' class to its content", function() {
        expect(view.hasClass('passed')).to(be_false);
        example.run();
        expect(view.hasClass('passed')).to(be_true);
      });
    });

    describe("#focus", function() {
      var original_screw_options;
      before(function() {
        original_screw_options = Screw.Interface.options;
        Screw.Interface.options = {};
      });

      after(function() {
        Screw.Interface.options = original_screw_options;
      });

      it("saves [example.path()] to Prefs.data.run_paths and calls Screw.Interface.refresh", function() {
        mock(Screw.Interface, 'refresh');
        Prefs.data.run_paths = null;
        Prefs.save();

        view.focus();

        Prefs.load();
        expect(Prefs.data.run_paths).to(equal, [example.path()]);
        expect(Screw.Interface.refresh).to(have_been_called);
      });
    });
  });
}});