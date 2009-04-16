Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Description", function() {
    var description, view;
    before(function() {
      var parent_description = new Screw.Description("parent description");
      description = new Screw.Description("description");
      parent_description.add_description(description);
    });

    describe("#content", function() {
      context("when the view is instantiated without the build_immediately option", function() {
        var example_1, example_2, set_timeout_callback;
        before(function() {
          example_1 = new Screw.Example("example 1", function() { });
          example_2 = new Screw.Example("example 2", function() { });
          description.add_example(example_1);
          description.add_example(example_2);
        });

        it("renders the outline of the Description's view immediately", function() {
          view = Screw.Disco.build(Screw.Interface.Description, {description: description});

          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 0);
        });

//        it("renders the Description's descendents in a setTimeout context", function() {
//          var examples = view.find('ul.examples');
//          return function() {
//            expect(examples.length).to(equal, 1);
//            expect(examples.find('li').length).to(equal, 2);
//            expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_1}).html());
//            expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_2}).html());
//          }
//        });

        it("renders the Description's descendents in a setTimeout context", function() {
          mock(window, "setTimeout", function(callback, delay) { callback.call(window); });
          view = Screw.Disco.build(Screw.Interface.Description, {description: description});

          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 2);
          expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_1}).html());
          expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_2}).html());
        });
      });

      context("when the view's Description has #examples", function() {
        var example_1, example_2;
        before(function() {
          example_1 = new Screw.Example("example 1", function() {
            if (should_fail) throw(new Error(failure_message));
          });
          example_2 = new Screw.Example("example 2", function() {
            if (should_fail) throw(new Error(failure_message));
          });
          description.add_example(example_1);
          description.add_example(example_2);
          view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
        });

        it("renders all examples within a ul.examples", function() {
          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 2);
          expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_1}).html());
          expect(examples.html()).to(match, Screw.Disco.build(Screw.Interface.Example, {example: example_2}).html());
        });
      });

      context("when the view's Description has no #examples", function() {
        before(function() {
          view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
        });

        it("does not render a ul.examples", function() {
          expect(view.find('ul.examples')).to(be_empty);
        });
      });

      context("when the view's Description has #child_descriptions", function() {
        var child_description_1, child_description_2;
        before(function() {
          child_description_1 = new Screw.Description("child description 1");
          child_description_2 = new Screw.Description("child description 2");
          description.add_description(child_description_1);
          description.add_description(child_description_2);
          view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
        });

        it("renders all child descriptions within a ul.child_descriptions", function() {
          var child_descriptions = view.find('ul.child_descriptions');
          expect(child_descriptions.length).to(equal, 1);
          expect(child_descriptions.find('li').length).to(equal, 2);
          expect(child_descriptions.html()).to(match, Screw.Disco.build(Screw.Interface.Description, {description: child_description_1, build_immediately: true}).html());
          expect(child_descriptions.html()).to(match, Screw.Disco.build(Screw.Interface.Description, {description: child_description_2, build_immediately: true}).html());
        });

      });

      context("when the view's Description has no #child_descriptions", function() {
        before(function() {
          view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
        });

        it("does not render a ul.child_descriptions", function() {
          expect(view.find('ul.child_descriptions')).to(be_empty);
        });
      });
    });

    describe("when span.name is clicked", function() {
      before(function() {
        view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
      });

      it("calls #focus on the view", function() {
        mock(view, 'focus');
        view.find("span.name").click();
        expect(view.focus).to(have_been_called);
      });
    });

    describe("when an Example nested within the associated Description is completed", function() {
      var grandchild_example, should_fail;
      before(function() {
        view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
        var child_description = new Screw.Description("child description");
        grandchild_example = new Screw.Example("grandchild example", function() {
          if (should_fail) throw(new Error("fails intentionally"));
        })
        child_description.add_example(grandchild_example);
        description.add_description(child_description);
      });

      context("when the Example passes", function() {
        before(function() {
          should_fail = false;
        });

        it("applies the 'passed' class to its content", function() {
          expect(view.hasClass('failed')).to(be_false);
          expect(view.hasClass('passed')).to(be_false);

          grandchild_example.run();

          expect(view.hasClass('failed')).to(be_false);
          expect(view.hasClass('passed')).to(be_true);
        });
      });

      context("when the Example fails", function() {
        before(function() {
          should_fail = true;
        });

        it("applies the 'failed' class to its content", function() {
          expect(view.hasClass('failed')).to(be_false);
          expect(view.hasClass('passed')).to(be_false);
          grandchild_example.run();
          expect(view.hasClass('failed')).to(be_true);
          expect(view.hasClass('passed')).to(be_false);
        });
      });
    });

    describe("#focus", function() {
      before(function() {
        view = Screw.Disco.build(Screw.Interface.Description, {description: description, build_immediately: true});
      });

      it("saves [description.path()] to Prefs.data.run_paths and calls Screw.Interface.refresh", function() {
        mock(Screw.Interface, 'refresh');
        Prefs.data.run_paths = null;
        Prefs.save();

        view.focus();

        Prefs.load();
        expect(Prefs.data.run_paths).to(equal, [description.path()]);
        expect(Screw.Interface.refresh).to(have_been_called);
      });
    });
  });
}});