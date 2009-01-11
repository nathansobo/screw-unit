Screw.Unit(function(c) { with(c) {
  describe("Screw.Interface.Runner", function() {
    function render_view(root, runnable) {
      return Disco.build(Screw.Interface.Runner, {root: root, runnable: runnable});
    }

    describe("#content", function() {
      var root, child_description_1, child_description_2, view;

      before(function() {
        root = new Screw.Description("");
        child_description_1 = new Screw.Description("child 1");
        child_description_2 = new Screw.Description("child 2");
        root.add_description(child_description_1);
        root.add_description(child_description_2);
        view = render_view(root, root);
      });

      it("renders a ul.descriptions with the #child_descriptions of the given root", function() {
        expect(view.html()).to(match, Disco.build(Screw.Interface.Description, {description: child_description_1}).html());
        expect(view.html()).to(match, Disco.build(Screw.Interface.Description, {description: child_description_2}).html());
      });
    });


    describe("when the 'Show Failed' button is clicked", function() {
      var root, description;

      it("hides descriptions that have no failing examples", function() {
        root = new Screw.Description("");
        description = new Screw.Description("description with passing examples");
        description.add_example = new Screw.Example("passing example", function() {});
        root.add_description(description);

        var view = render_view(root, root);

        console.debug(view.html());
        

        expect(view.html()).to(match, "description with passing examples");
        view.find("button#show_failed").click();
        expect(view.html()).to_not(match, "description with passing examples");
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

    describe("when span.name clicked", function() {
      before(function() {
        view = Disco.build(Screw.Interface.Description, {description: description});
      });
      
      it("calls #focus on the associated Description", function() {
        mock(description, 'focus');
        view.find("span.name").click();
        expect(description.focus).to(have_been_called);
      });
    });
  });
  
  describe("Screw.Interface.Example", function() {
    var example, view, failure_message, should_fail;
    before(function() {
      failure_message = "sharon ly says die!";
      example = new Screw.Example("passes or fails", function() {
        if (should_fail) throw(new Error(failure_message));
      });
      example.parent_description = new Screw.Description();
      view = Disco.build(Screw.Interface.Example, {example: example});
    });

    describe("#content", function() {
      it("renders the associated Example's #name", function() {
        expect(view.html()).to(match, example.name);
      });
    });
    
    describe("when clicked", function() {
      it("calls #focus on the example", function() {
        mock(example, 'focus');
        view.find('span').click();
        expect(example.focus).to(have_been_called);
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