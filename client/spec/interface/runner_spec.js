Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Runner", function() {
    var root, child_description_1, child_description_2, view;

    before(function() {
      root = new Screw.Description("all specs");
      child_description_1 = new Screw.Description("child description 1");
      child_description_2 = new Screw.Description("child description 2");
      root.add_description(child_description_1);
      root.add_description(child_description_2);
      view = Screw.Disco.build(Screw.Interface.Runner, {root: root, build_immediately: true});
    });

    context("when Prefs.show == 'all'", function() {
      before(function() {
        Prefs.data.show = "all";
      });

      it("renders itself with the 'show_all' class and not the 'show_failed' class", function() {
        view = Screw.Disco.build(Screw.Interface.Runner, {root: root, build_immediately: true});
        expect(view.hasClass("show_all")).to(be_true);
        expect(view.hasClass("show_failed")).to(be_false);
      });
    });

    context("when Prefs.show == 'failed'", function() {
      before(function() {
        Prefs.data.show = "failed";
      });

      it("renders itself with the 'show_failed' class and not the 'show_all' class", function() {
        view = Screw.Disco.build(Screw.Interface.Runner, {root: root, build_immediately: true});
        expect(view.hasClass("show_failed")).to(be_true);
        expect(view.hasClass("show_all")).to(be_false);
      });
    });

    describe("buttons", function() {
      var passing_example, failing_example_1, failing_example_2, example_1;
      before(function() {
        passing_example = new Screw.Example("passing example 1", function() {
        });
        failing_example_1 = new Screw.Example("failing example 1", function() {
          throw new Error();
        });
        failing_example_2 = new Screw.Example("failing example 1", function() {
          throw new Error();
        });
        child_description_1.add_example(passing_example);
        child_description_1.add_example(failing_example_1);
        child_description_1.add_example(failing_example_2);
        view = Screw.Disco.build(Screw.Interface.Runner, {root: root, build_immediately: true});
      });

      describe("when the 'Show Failed' button is clicked", function() {
        it("applies the 'show_failed' class to the root element of the view", function() {
          expect(view.hasClass('show_failed')).to(be_false);
          view.find("button#show_failed").click();
          expect(view.hasClass('show_failed')).to(be_true);
        });

        it("removes the 'show_all' class from the root element of the view", function() {
          view.addClass("show_all");
          view.find("button#show_failed").click();
          expect(view.hasClass('show_all')).to(be_false);
        });

        it("hides descriptions that have no failing examples", function() {
          passing_example.run();

          expect(view.find("li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to_not(be_empty);
          view.find("button#show_failed").click();
          expect(view.find("li:contains('child description 1'):visible")).to(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to(be_empty);
        });

        it("shows only descriptions that have failing examples", function() {
          failing_example_1.run();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to_not(be_empty);
          view.find("button#show_failed").click();
          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to(be_empty);
        });

        it("sets Prefs.data.show to 'failed'", function() {
          Prefs.data = { show: null };
          Prefs.save();

          view.find("button#show_failed").click();

          Prefs.load();
          expect(Prefs.data.show).to(equal, "failed");
        });
      });

      describe("when the 'Show All' button is clicked", function() {
        it("applies the 'show_all' class to the root element of the view", function() {
          view.removeClass("show_all");
          expect(view.hasClass('show_all')).to(be_false);
          view.find("button#show_all").click();
          expect(view.hasClass('show_all')).to(be_true);
        });

        it("removes the 'show_all' class from the root element of the view", function() {
          view.addClass("show_failed");
          view.find("button#show_all").click();
          expect(view.hasClass('show_failed')).to(be_false);
        });

        it("shows any hidden descriptions and examples", function() {
          failing_example_1.run();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to_not(be_empty);

          view.find("button#show_failed").click();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to(be_empty);

          view.find("button#show_all").click();

          expect(view.find("li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to_not(be_empty);
        });

        it("sets Prefs.data.show to 'all'", function() {
          Prefs.data = { show: null };
          Prefs.save();

          view.find("button#show_all").click();

          Prefs.load();
          expect(Prefs.data.show).to(equal, "all");
        });
      });

      describe("when the 'Rerun Failed' button is clicked", function() {
        before(function() {
          failing_example_1.run();
          failing_example_2.run();
        });

        it("saves Prefs.data.run_paths to an Array of the #paths of all failing Examples and calls Screw.Interface.refresh", function() {
          Prefs.data.run_paths = null;
          Prefs.save();

          mock(Screw.Interface, 'refresh');

          view.find("button#rerun_failed").click();

          Prefs.load();
          expect(Prefs.data.run_paths).to(equal, [failing_example_1.path(), failing_example_2.path()]);
          expect(Screw.Interface.refresh).to(have_been_called);
        });
      });

      describe("when the 'Rerun All' button is clicked", function() {
        it("saves Prefs.data.run_paths to null and calls Screw.Interface.refresh", function() {
          Prefs.data.run_paths = "foo";
          Prefs.save();

          mock(Screw.Interface, 'refresh');
          view.find("button#rerun_all").click();

          Prefs.load();
          expect(Prefs.data.run_paths).to(be_null);
          expect(Screw.Interface.refresh).to(have_been_called);
        });
      });
    });

    describe("#update", function() {
      describe("when the examples are completed", function() {
        before(function() {
          view.completed_example_count = 0;
          view.total_examples = 1;
        });

        after(function() {
          expect(view.completed_example_count).to(equal, view.total_examples);
        });

        describe("when there were failures", function() {
          before(function() {
            mock(Screw.root_description(), "failed_examples", function() { return [1]; });
          });

          after(function() {
            Screw.$("ul.descriptions").removeClass("failed");
          });

          it("adds the .failed class to the root description", function() {
            view.update();

            expect(Screw.root_description().failed_examples).to(have_been_called, once);
            expect(Screw.$("ul.descriptions").hasClass("failed")).to(be_true);
          });
        });

        describe("when all examples passed", function() {
          before(function() {
            mock(Screw.root_description(), "failed_examples", function() { return []; });
          });

          after(function() {
            Screw.$("ul.descriptions").removeClass("passed");
          });

          it("adds the .passed class to the root description", function() {
              view.update();
              expect(Screw.root_description().failed_examples).to(have_been_called, once);
              expect(Screw.$("ul.descriptions").hasClass("passed")).to(be_true);
          });
        });
      });
    });
  });
}});
