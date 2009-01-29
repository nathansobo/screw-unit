Screw.Unit(function(c) { with(c) {
  var original_prefs_data;

  before(function() {
    original_prefs_data = jQuery.extend({}, Prefs.data);
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
      var original_options;

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

  
  describe("Screw.Interface.Runner", function() {
    var root, child_description_1, child_description_2, view;

    before(function() {
      root = new Screw.Description("all specs");
      child_description_1 = new Screw.Description("child description 1");
      child_description_2 = new Screw.Description("child description 2");
      root.add_description(child_description_1);
      root.add_description(child_description_2);
      view = Disco.build(Screw.Interface.Runner, {root: root, runnable: root});
    });

    context("when Prefs.show == 'all'", function() {
      before(function() {
        Prefs.data.show = "all";
      });

      it("renders itself with the 'show_all' class and not the 'show_failed' class", function() {
        view = Disco.build(Screw.Interface.Runner, {root: root, runnable: root});
        expect(view.hasClass("show_all")).to(be_true);
        expect(view.hasClass("show_failed")).to(be_false);
      });
    });

    context("when Prefs.show == 'failed'", function() {
      before(function() {
        Prefs.data.show = "failed";
      });

      it("renders itself with the 'show_failed' class and not the 'show_all' class", function() {
        view = Disco.build(Screw.Interface.Runner, {root: root, runnable: root});
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
        view = Disco.build(Screw.Interface.Runner, {root: root, runnable: root});
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
  });

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

      view = Disco.build(Screw.Interface.ProgressBar, {examples_to_run: [description_1, description_2]})
    });

    describe("when an example within one of the associated examples to run is completed", function() {
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

    describe("when an example within the associated runnable fails", function() {
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

  describe("Screw.Interface.Description", function() {
    var description, view;
    before(function() {
      var parent_description = new Screw.Description("parent description");
      description = new Screw.Description("description");
      parent_description.add_description(description);
    });

    describe("#content", function() {
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
          view = Disco.build(Screw.Interface.Description, {description: description});
        });

        it("renders all examples within a ul.examples", function() {
          var examples = view.find('ul.examples');
          expect(examples.length).to(equal, 1);
          expect(examples.find('li').length).to(equal, 2);
          expect(examples.html()).to(match, Disco.build(Screw.Interface.Example, {example: example_1}).html());
          expect(examples.html()).to(match, Disco.build(Screw.Interface.Example, {example: example_2}).html());
        });
      });

      context("when the view's Description has no #examples", function() {
        before(function() {
          view = Disco.build(Screw.Interface.Description, {description: description});
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
          view = Disco.build(Screw.Interface.Description, {description: description});
        });
        
        it("renders all child descriptions within a ul.child_descriptions", function() {
          var child_descriptions = view.find('ul.child_descriptions');
          expect(child_descriptions.length).to(equal, 1);
          expect(child_descriptions.find('li').length).to(equal, 2);
          expect(child_descriptions.html()).to(match, Disco.build(Screw.Interface.Description, {description: child_description_1}).html());
          expect(child_descriptions.html()).to(match, Disco.build(Screw.Interface.Description, {description: child_description_2}).html());
        });
        
      });

      context("when the view's Description has no #child_descriptions", function() {
        before(function() {
          view = Disco.build(Screw.Interface.Description, {description: description});
        });

        it("does not render a ul.child_descriptions", function() {
          expect(view.find('ul.child_descriptions')).to(be_empty);
        });
      });
    });

    describe("when span.name is clicked", function() {
      before(function() {
        view = Disco.build(Screw.Interface.Description, {description: description});
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
        view = Disco.build(Screw.Interface.Description, {description: description});
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
        view = Disco.build(Screw.Interface.Description, {description: description});
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
  
  describe("Screw.Interface.Example", function() {
    var example, description, view, failure_message, should_fail;
    before(function() {
      failure_message = "sharon ly says die!";
      example = new Screw.Example("passes or fails", function() {
        if (should_fail) throw(new Error(failure_message));
      });

      description = new Screw.Description("parent description");
      description.add_example(example);
      view = Disco.build(Screw.Interface.Example, {example: example});
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
        expect(view.html()).to(match, stack);
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
        original_screw_options =  Screw.Interface.options;
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