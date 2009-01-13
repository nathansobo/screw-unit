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
  
  describe("Screw.Example", function() {
    var example, name, fn, should_fail, parent_description, events, original_reset_mocks, example_contexts;

    before(function() {
      events = [];
      example_contexts = [];

      name = "example"
      should_fail = false;
      fn = function() {
        events.push("example function called");
        example_contexts.push(this);
        if (should_fail) throw(new Error("sad times"));
      };
      example = new Screw.Example(name, fn);
      parent_description = new Screw.Description("parent description")
      parent_description.run_befores = function(example_context) {
        events.push("run_befores called");
        example_contexts.push(example_context);
      }
      parent_description.run_afters = function(example_context) {
        events.push("run_afters called");
        example_contexts.push(example_context);
      }

      example.parent_description = parent_description;

      original_reset_mocks = Screw.reset_mocks;
      Screw.reset_mocks = function() {
        events.push("reset_mocks called");
      }
    });

    after(function() {
      Screw.reset_mocks = original_reset_mocks;
    });

    describe("#initialize", function() {
      it("assigns #name and #fn", function() {
        expect(example.name).to(equal, name);
        expect(example.fn).to(equal, fn);
      });
      
      it("sets #failed and #passed to false", function() {
        expect(example.passed).to(be_false);
        expect(example.failed).to(be_false);
      });
    });
    
    describe("#run", function() {
      it("with the same example context, calls parent_description.run_befores, invokes the example function, calls parent_description.run_afters, then calls Screw.reset_mocks", function() {
        example.run();
        expect(events).to(equal, ["run_befores called", "example function called", "run_afters called", "reset_mocks called"]);
        expect(example_contexts.length).to(equal, 3);
        expect(example_contexts[0]).to(equal, example_contexts[1]);
        expect(example_contexts[0]).to(equal, example_contexts[2]);
      });

      context("if the example fails", function() {
        before(function() {
          should_fail = true;
        });
        
        it("invokes callbacks registered with #on_fail", function() {
          var callback_invoked = false;
          example.on_fail(function() {
            callback_invoked = true;
          })
          example.run();
          expect(callback_invoked).to(be_true);
        });

        it("assigns #failed to true and #passed to false", function() {
          expect(example.passed).to(be_false);
          expect(example.failed).to(be_false);
          example.run();
          expect(example.passed).to(be_false);
          expect(example.failed).to(be_true);
        });
      });

      context("if the example passes", function() {
        before(function() {
          expect(should_fail).to(be_false);
        });

        it("invokes callbacks registered with #on_pass", function() {
          var callback_invoked = false;
          example.on_pass(function() {
            callback_invoked = true;
          })
          example.run();
          expect(callback_invoked).to(be_true);
        });

        it("assigns #passed to true and #failed to false", function() {
          expect(example.passed).to(be_false);
          expect(example.failed).to(be_false);
          example.run();
          expect(example.passed).to(be_true);
          expect(example.failed).to(be_false);
        });
      });
    });

    describe("#total_examples", function() {
      it("always returns 1", function() {
        expect(example.total_examples()).to(equal, 1);
      });
    });

    describe("#path", function() {
      it("returns #index concatenated to the #path of the #parent_description", function() {
        expect(example.path()).to(equal, parent_description.path() + [example.index]);
      });
    });
  });
}});