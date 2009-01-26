Screw.Unit(function(c) { with(c) {
  var original_prefs_data;

  before(function() {
    original_prefs_data = Prefs.data;
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

      it("calls Screw.Interface.set_location with the current location plus the serialized Screw.Interface.options", function() {
        Screw.Interface.options = {
          foo: "bar",
          baz: "bop"
        };

        mock(Screw.Interface, 'set_location');
        var expected_base_location = window.location.href.split('?')[0];

        Screw.Interface.refresh();

        var actual_location = Screw.Interface.set_location.most_recent_args[0];

        expect(actual_location).to(match, expected_base_location);

        // testing "foo=bar&baz=bop" in presence of nondeterministic ordering
        expect(actual_location).to(match, "foo=bar");
        expect(actual_location).to(match, "baz=bop");
        expect(actual_location).to(match, "&");
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


    describe(".parse_options", function() {
      it("extracts serialized options from the location and assigns them to the Screw.Interface.options object", function() {
        mock(Screw.Interface, 'get_location', function() {
          return "http://test.example.org?foo=bar&baz=bop";
        })

        expect(Screw.Interface.options).to(equal, {});
        Screw.Interface.parse_options();
        expect(Screw.Interface.options).to(equal, {
          foo: 'bar',
          baz: 'bop'
        });
      });
    });

    describe(".focused_runnable", function() {
      context("when Screw.Interface.options is undefined", function() {
        it("returns the root passed in initial_attributes", function() {
          expect(Screw.Interface.focused_runnable()).to(equal, Screw.global_description());
        });
      });

      context("when Screw.Interface.options is a comma-delimited focus path", function() {
        it("returns the result of root.runnable_at_path for the focus path converted into an array", function() {
          Screw.Interface.options.focus_path = "1,2,3";
          var focused = {}; 
          mock(Screw.global_description(), 'runnable_at_path', function(path) {
            expect(path).to(equal, [1, 2, 3]);
            return focused;
          })
          expect(Screw.Interface.focused_runnable()).to(equal, focused);
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

    describe("show buttons", function() {
      var passing_example, failing_example, example_1;
      before(function() {
        passing_example = new Screw.Example("passing example 1", function() {
        });
        failing_example = new Screw.Example("failing example 1", function() {
          throw new Error();
        });
        child_description_1.add_example(passing_example);
        child_description_1.add_example(failing_example);
      });
      
      describe("when the 'Show Failed' button is clicked", function() {
        it("hides descriptions that have no failing examples", function() {
          passing_example.run();

          expect(view.find("li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to_not(be_empty);
          view.find("button#show_failed").click();
          expect(view.find("li:contains('child description 1'):visible")).to(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to(be_empty);
        });

        it("shows only descriptions that have failing examples", function() {
          failing_example.run();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to_not(be_empty);
          view.find("button#show_failed").click();
          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to(be_empty);
        });

        it("sets 'show' to 'failed' in the preferences", function() {
          Prefs.data = { show: null };
          Prefs.save();

          view.find("button#show_failed").click();

          Prefs.load();
          expect(Prefs.data.show).to(equal, "failed");
        });
      });

      describe("when the 'Show All' button is clicked", function() {
        it("shows any hidden descriptions and examples", function() {
          failing_example.run();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to_not(be_empty);

          view.find("button#show_failed").click();

          expect(view.find("li ul li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li ul li:contains('child description 2'):visible")).to(be_empty);

          view.find("button#show_all").click();

          expect(view.find("li:contains('child description 1'):visible")).to_not(be_empty);
          expect(view.find("li:contains('child description 2'):visible")).to_not(be_empty);
        });

        it("sets 'show' to 'all' in the preferences", function() {
          Prefs.data = { show: null };
          Prefs.save();

          view.find("button#show_all").click();

          Prefs.load();
          expect(Prefs.data.show).to(equal, "all");
        });
      });
    });
  });

  describe("Screw.Interface.Description", function() {
    var description, view;
    before(function() {
      description = new Screw.Description("description");
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

        context("when the 'show' preference is set to 'all'", function() {
          it("renders all examples within a ul.examples", function() {
            var examples = view.find('ul.examples');
            expect(examples.length).to(equal, 1);
            expect(examples.find('li').length).to(equal, 2);
            expect(examples.html()).to(match, Disco.build(Screw.Interface.Example, {example: example_1}).html());
            expect(examples.html()).to(match, Disco.build(Screw.Interface.Example, {example: example_2}).html());
          });
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
      it("sets Screw.Interface.options.focus_path to the serialized #path of the associated Description and calls Screw.Interface.refresh", function() {
        mock(Screw.Interface, 'refresh');
        view.focus();
        expect(Screw.Interface.options.focus_path).to(equal, description.path().join(","));
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
      
      it("sets Screw.Interface.options.focus_path to the #path of the associated Example and calls Screw.Interface.refresh", function() {
        mock(Screw.Interface, 'refresh');
        view.focus();
        expect(Screw.Interface.options.focus_path).to(equal, example.path().join(","));
        expect(Screw.Interface.refresh).to(have_been_called);
      });
    });
  });

  describe("Screw.Interface.ProgressBar", function() {
    var description, example_1, example_2, view, should_fail;
    before(function() {
      should_fail = false;
      description = new Screw.Description("description");
      example_1 = new Screw.Example("example 1", function() {
        if (should_fail) throw "flunk";
      });
      example_2 = new Screw.Example("example 1", function() {
        if (should_fail) throw "flunk";
      });
      description.add_example(example_1);
      description.add_example(example_2);
      view = Disco.build(Screw.Interface.ProgressBar, {runnable: description})
    });

    describe("when an example within the associated runnable is completed", function() {
      it("updates the width of the progress bar to the proportion of completed examples and updates the 'n of m completed' text", function() {
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '0%');
        expect(view.html()).to(match, "0 of 2");
        example_1.run();
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '50%');
        expect(view.html()).to(match, "1 of 2");
        example_2.run();
        expect(view.find('div#screw_unit_progress').css('width')).to(equal, '100%');
        expect(view.html()).to(match, "2 of 2");
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
}});