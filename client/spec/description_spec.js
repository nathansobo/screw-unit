Screw.Unit(function(c) { with(c) {
  describe("Screw.Description", function() {
    var description, name, examples;

    before(function() {
      name = "description"
      description = new Screw.Description(name);
      examples = [];
      examples.push(new Screw.Example("example 1", function() {}));
      examples.push(new Screw.Example("example 2", function() {}));
      Screw.each(examples, function() {
        description.add_example(this);
      });
    });

    describe("#initialize", function() {
      it("assigns #name", function() {
        expect(description.name).to(equal, name);
      });
    });
    
    describe("#enqueue", function() {
      it("calls #enqueue on all examples and child descriptions", function() {
        var child_description = new Screw.Description("child description");
        description.add_description(child_description);

        Screw.each(examples, function() {
          mock(this, 'enqueue');
        })
        mock(child_description, 'enqueue');

        description.enqueue();

        Screw.each(examples, function() {
          expect(this.enqueue).to(have_been_called);
        })
        expect(child_description.enqueue).to(have_been_called);
      });
    });

    describe("#run", function() {
      it("calls #run on all examples and child descriptions", function() {
        var child_description = new Screw.Description("child description");
        description.add_description(child_description);

        Screw.each(examples, function() {
          mock(this, 'run');
        })
        mock(child_description, 'run');

        description.run();
        
        Screw.each(examples, function() {
          expect(this.run).to(have_been_called);
        })
        expect(child_description.run).to(have_been_called);
      });
    });

    describe("#total_examples", function() {
      it("sums all examples it contains and all the examples for all descriptions nested within it", function() {
        expect(description.total_examples()).to(equal, examples.length);

        var nested_description = new Screw.Description("nested description with an example");
        nested_description.add_example(new Screw.Example("example", function() {}));
        description.add_description(nested_description);
        expect(description.total_examples()).to(equal, examples.length + nested_description.total_examples());
      });
    });

    describe("with failing examples", function() {
      var root_description, child_description, passing_child_example, failing_child_example, passing_grandchild_example, failing_grandchild_example;
      before(function() {
        root_description = new Screw.Description("root description")
        child_description = new Screw.Description("child description")
        passing_child_example = new Screw.Example("passing child example", function() {});
        passing_grandchild_example = new Screw.Example("passing grandchild example", function() {});
        failing_child_example = new Screw.Example("failing child example", function() {
          throw new Error("child error message");
        })
        failing_grandchild_example = new Screw.Example("failing grandchild example", function() {
          throw new Error("grandchild error message");
        })

        root_description.add_description(child_description);
        root_description.add_example(passing_child_example);
        root_description.add_example(failing_child_example);
        child_description.add_example(passing_grandchild_example);
        child_description.add_example(failing_grandchild_example);
      });

      describe("#failed_examples", function() {
        it("returns all failed Examples descending from this describe", function() {
          root_description.run();
          expect(root_description.failed_examples()).to(equal, [failing_child_example, failing_grandchild_example]);
        });
      });

      describe("#failure_messages", function() {
        it("returns an array of the failure messages for all failing descendent examples", function() {
          root_description.run();
          expect(root_description.failure_messages()).to(equal, [failing_child_example.failure_message,  failing_grandchild_example.failure_message]);
        });
      });
    });

    describe("callbacks registered via #on_example_completed", function() {
      var on_example_completed_args;

      before(function() {
        on_example_completed_args = [];
        description.on_example_completed(function(example) {
          on_example_completed_args.push(example);
        });
      });
      
      describe("when an Example has completed", function() {
        it("invokes registered callbacks", function() {
          var example = examples[0];
          example.run();
          expect(on_example_completed_args).to(equal, [example]);
        });
      });

      describe("when a descendant Example is completed", function() {
        it("invokes registered callbacks", function() {
          var child_description = new Screw.Description("child description");
          var grandchild_example = new Screw.Example("grandchild example", function() {});
          child_description.add_example(grandchild_example);
          description.add_description(child_description);
          grandchild_example.run();
          expect(on_example_completed_args).to(equal, [grandchild_example]);
        });
      });
    });


    describe("methods dealing with paths", function() {
      var root_description, child_description_0, child_description_1, grandchild_description_1_0;
      before(function() {
        root_description = new Screw.Description("root description");
        child_description_0 = new Screw.Description("child description 0");
        child_description_1 = new Screw.Description("child description 1");
        grandchild_description_1_0 = new Screw.Description("grandchild description 1 0");
        root_description.add_description(child_description_0)
        root_description.add_description(child_description_1);
        child_description_1.add_description(grandchild_description_1_0);
      });
      
      describe("#path", function() {
        context("when there is no #parent_description", function() {
          it("returns an empty Array", function() {
            expect(description.path()).to(be_empty);
          });
        });

        context("when there is a #parent_description", function() {
          it("returns #index concatenated to the #path of the #parent_description", function() {
            expect(child_description_0.path()).to(equal, [0]);
            expect(grandchild_description_1_0.path()).to(equal, [1, 0]);
          });
        });
      });

      describe("#runnable_at_path", function() {
        it("returns the runnable object (Example or Description) found by traversing the tree along the given path", function() {
          expect(root_description.runnable_at_path([1, 0])).to(equal, grandchild_description_1_0);
        });
      });
    });
    
    describe("#run_befores", function() {
      it("calls #run_befores on the #parent_description if there is one, then runs all the befores in the order they were added", function() {
        var events = [];
        var example_contexts = [];
        description.add_before(function() {
          events.push("parent before called")
          example_contexts.push(this);
        });
        var child_description = new Screw.Description("child description");
        child_description.add_before(function() {
          events.push("child before 1 called");
          example_contexts.push(this);
        });

        child_description.add_before(function() {
          events.push("child before 2 called");
          example_contexts.push(this);
        });
        description.add_description(child_description);
        
        child_description.run_befores();

        expect(events).to(equal, ["parent before called", "child before 1 called", "child before 2 called"]);
        expect(example_contexts.length).to(equal, 3);
        expect(example_contexts[0]).to(equal, example_contexts[1]);
        expect(example_contexts[0]).to(equal, example_contexts[2]);
      });
    });

    describe("#run_afters", function() {
      it("runs all the afters in the order they were added, with the given example context, then calls #run_afters on the #parent_description if there is one", function() {
        var events = [];
        var example_contexts = [];
        description.add_after(function() {
          events.push("parent after called")
          example_contexts.push(this);
        });
        var child_description = new Screw.Description("child description");
        child_description.add_after(function() {
          events.push("child after 1 called");
          example_contexts.push(this);
        })

        child_description.add_after(function() {
          events.push("child after 2 called");
          example_contexts.push(this);
        })
        description.add_description(child_description);

        child_description.run_afters();

        expect(events).to(equal, ["child after 1 called", "child after 2 called", "parent after called"]);
        expect(example_contexts.length).to(equal, 3);
        expect(example_contexts[0]).to(equal, example_contexts[1]);
        expect(example_contexts[0]).to(equal, example_contexts[2]);
      });
    });
  });
}});