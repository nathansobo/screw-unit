Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Runner", function() {
    var root, child_description_1, child_description_1_example, child_description_2, view, show;

    before(function() {
      Screw.Monarch.Queue.synchronous = true;

      root = new Screw.Description("all specs");
      child_description_1 = new Screw.Description("child description 1");
      child_description_2 = new Screw.Description("child description 2");
      child_description_1_example = new Screw.Example("child description 1 example", function() {  });
      child_description_1.add_example(child_description_1_example);

      root.add_description(child_description_1);
      root.add_description(child_description_2);

      view = Screw.Interface.Runner.to_view({root: root, build_immediately: true, show: show});
      mock(Screw.jQuery, 'cookie');
      mock(Screw.jQuery, 'ajax');
    });
    
    after(function() {
      Screw.Monarch.Queue.synchronous = false;
    });

    init(function() {
      show = 'all'
    });


    describe(".run_paths", function() {
      it("returns the string following # parsed as JSON", function() {
        mock(Screw.Interface, 'get_location', function() {
          return {
            href: "http://localhost:8080/specs?[[1], [2,0,0]]"
          }
        });
        expect(Screw.Interface.Runner.run_paths()).to(equal, [[1], [2,0,0]]);
      });
    });

    describe(".to_view", function() {
      context("when passed the show: 'all' option", function() {
        it("renders itself with the 'show_all' class and not the 'show_failed' class", function() {
          expect(view.hasClass("show_all")).to(be_true);
          expect(view.hasClass("show_failed")).to(be_false);
        });
      });

      context("when passed the show: 'failed' option'", function() {
        init(function() {
          show = 'failed';
        });

        it("renders itself with the 'show_failed' class and not the 'show_all' class", function() {
          expect(view.hasClass("show_failed")).to(be_true);
          expect(view.hasClass("show_all")).to(be_false);
        });
      });
    });


    describe("#run", function() {
      context("when passed an array of paths as the run_paths: option", function() {
        it("calls add_to_queue on the examples or descriptions corresponding to the paths, then starts the queue", function() {
          mock(child_description_1, 'add_to_queue');
          mock(child_description_1_example, 'add_to_queue');
          mock(child_description_2, 'add_to_queue');

          view.run([[0, 0], [1]]);

          expect(child_description_1.add_to_queue).to_not(have_been_called);
          expect(child_description_1_example.add_to_queue).to(have_been_called, once);
          expect(child_description_2.add_to_queue).to(have_been_called, once);
        });
      });

      context("when passed no run_paths", function() {
        it("calls #add_to_queue on root", function() {
          mock(root, 'add_to_queue');
          view.run();
          expect(root.add_to_queue).to(have_been_called);
        });
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
          expect(Screw.jQuery.cookie).to(have_been_called, with_args("__screw_unit__show", "failed", {path: "/"}));
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
          expect(Screw.jQuery.cookie).to(have_been_called, with_args("__screw_unit__show", "all", {path: "/"}));
        });
      });

      describe("when the Rerun All button is clicked", function() {
        it("sets window.location to the current path, without any path specifier", function() {
          mock(Screw.Interface, 'get_location', function() {
            return { href: "http://localhost:8080/specs?[[0]]"};
          });

          mock(Screw.Interface, 'set_location');
          view.find("button#rerun_all").click();
          expect(Screw.Interface.set_location).to(have_been_called, with_args("http://localhost:8080/specs"));
        });
      });

      describe("when the Rerun Failed button is clicked", function() {
        it("sets window.location to the paths of all currently failing examples", function() {
          view.run();
          mock(Screw.Interface, 'get_location', function() {
            return { href: "http://localhost:8080/specs?[[0]]"};
          });
          mock(Screw.Interface, 'set_location');

          view.find("button#rerun_failed").click();

          expect(Screw.Interface.set_location).to(have_been_called);
          expect(Screw.Interface.set_location).to(have_been_called, with_args("http://localhost:8080/specs?" + JSON.stringify([failing_example_1.path(), failing_example_2.path()])));
        });
      });
    });

    describe("#example_completed", function() {
      describe("when the examples are completed", function() {
        before(function() {
          view.completed_example_count = 0;
          view.total_examples = 1;
        });

        describe("when there were failures", function() {
          before(function() {
            mock(Screw.root_description(), "failed_examples", function() { return [1]; });
          });

          it("adds the .failed class to the root description", function() {
            view.example_completed();

            expect(Screw.root_description().failed_examples).to(have_been_called, once);
            expect(view.find("ul.descriptions").hasClass("failed")).to(be_true);
          });
        });

        describe("when all examples passed", function() {
          before(function() {
            mock(Screw.root_description(), "failed_examples", function() { return []; });
          });

          it("adds the .passed class to the root description", function() {
            view.example_completed();
            expect(Screw.root_description().failed_examples).to(have_been_called, once);
            expect(view.find("ul.descriptions").hasClass("passed")).to(be_true);
          });
        });
      });
    });
  });
}});
