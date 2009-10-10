Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Runner", function() {
    var root, child_description_1, child_description_2, view, show;

    before(function() {
      root = new Screw.Description("all specs");
      child_description_1 = new Screw.Description("child description 1");
      child_description_2 = new Screw.Description("child description 2");
      root.add_description(child_description_1);
      root.add_description(child_description_2);
      view = Screw.Interface.Runner.to_view({root: root, build_immediately: true, show: show});
      mock(Screw.jQuery, 'cookie');
      mock(Screw.jQuery, 'ajax');
    });

    context("when passed the show: 'all' option", function() {
      it("renders itself with the 'show_all' class and not the 'show_failed' class", function() {
        view = Screw.Interface.Runner.to_view({root: root, build_immediately: true, show: 'all'});
        expect(view.hasClass("show_all")).to(be_true);
        expect(view.hasClass("show_failed")).to(be_false);
      });
    });

    context("when passed the show: 'failed' option'", function() {
      it("renders itself with the 'show_failed' class and not the 'show_all' class", function() {
        view = Screw.Interface.Runner.to_view({root: root, build_immediately: true, show: 'failed'});
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
        view = Screw.Interface.Runner.to_view({root: root, build_immediately: true});
      });

      describe("when the 'Show Failed' button is clicked", function() {
        before(function() {
          Screw.$('div#test_content').html(view);
        });

        after(function() {
          Screw.$("div#test_content").html("");
        });

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

        it("stores a cookie to retain the setting across refreshes", function() {
          view.find("button#show_failed").click();
          expect(Screw.jQuery.cookie).to(have_been_called, with_args("__screw_unit__show", "failed"));
        });
      });

      describe("when the 'Show All' button is clicked", function() {
        before(function() {
          Screw.$('div#test_content').html(view);
        });

        after(function() {
          Screw.$("div#test_content").html("");
        });

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

        it("stores a cookie to retain the setting across refreshes", function() {
          view.find("button#show_all").click();
          expect(Screw.jQuery.cookie).to(have_been_called, with_args("__screw_unit__show", "all"));
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

          it("adds the .failed class to the root description", function() {
            view.update();

            expect(Screw.root_description().failed_examples).to(have_been_called, once);
            expect(view.find("ul.descriptions").hasClass("failed")).to(be_true);
          });
        });

        describe("when all examples passed", function() {
          before(function() {
            mock(Screw.root_description(), "failed_examples", function() { return []; });
          });


          it("adds the .passed class to the root description", function() {
              view.update();
              expect(Screw.root_description().failed_examples).to(have_been_called, once);
              expect(view.find("ul.descriptions").hasClass("passed")).to(be_true);
          });
        });
      });
    });
  });
}});
