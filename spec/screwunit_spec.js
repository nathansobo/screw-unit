Screw.Unit(function() {
  describe('Screw.Unit', function() {
    describe("Matchers", function() {
      it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
      });

      it("equal matches Arrays with the same elements", function() {
        expect([1, 2, 4]).to(equal, [1, 2, 3]);
        expect([1, 2, 3]).to_not(equal, [3, 2, 1]);
      });

      describe("#be_empty", function() {
        it("matches on Array#lenth == 0", function() {
          expect([]).to(be_empty);
          expect([1]).to_not(be_empty);
        })
      });
    });

    describe('#run', function() {
      describe("A describe with a before and after block", function() {
        var before_invoked = false;
        var after_invoked = false;
        before(function() {
          try {
            expect(before_invoked).to(equal, false);
          } finally {
            before_invoked = true;
            after_invoked = false;
          }
        });
        after(function() {
          try {
            expect(after_invoked).to(equal, false);
          } finally {
            before_invoked = false;
            after_invoked = true;
          }
        });

        it("invokes the before prior to an it", function() {
          expect(before_invoked).to(equal, true);
        });

        it("invokes the before prior to each it", function() {
          expect(before_invoked).to(equal, true);
        });

        it("invokes the after post an it", function() {
          expect(after_invoked).to(equal, false);
        });
      });

      describe("A describe with two before blocks", function() {
        var invocations = [];
        before(function() {
          invocations.push('before 1');
        });

        before(function() {
          invocations.push('before 2');
        });

        it("invokes the befores in lexical order prior to each it", function() {
          expect(invocations).to(equal, ['before 1', 'before 2']);
        });
      });

      describe("A describe with a nested describe", function() {
        var invocations = [];
        before(function() {
          invocations = [];
          invocations.push("outermost before");
        });

        it("after a nested describe, does not invoke any of its befores", function() {
          expect(invocations).to(equal, ["outermost before"]);
        });

        describe("a nested describe", function() {
          before(function() {
            invocations.push("inner before");
          });

          describe("a doubly nested describe", function() {
            before(function() {
              invocations.push('innermost before');
            })

            it("runs befores in all ancestors prior to an it", function() {
              expect(invocations).to(equal, ["outermost before", "inner before", "innermost before"]);
            });

            it("runs befores in all ancestors prior to each it", function() {
              expect(invocations).to(equal, ["outermost before", "inner before", "innermost before"]);
            });
          });

          it("runs a before in the parent describe before each it", function() {
            expect(invocations).to(equal, ["outermost before", "inner before"]);
          });
        });
      });

      var before_triggered = false;
      $(Screw).bind('before', function() {
        before_triggered = true;
      });
      describe("$(Screw).bind('before')", function() {
        it('invokes before bindings before the specs run', function() {
          expect(before_triggered).to(equal, true);
        });
      });
    });

    describe("#selector", function() {
      describe('a describe', function() {
        it('returns a css selector that uniquely locates the describe', function() {
          $('.describe').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });

      describe('an it', function() {
        it('returns a css selector that uniquely locates the it', function() {
          $('.it').each(function() {
            expect($($(this).fn('selector')).get(0)).to(equal, $(this).get(0))
          });
        });
      });
    });
  });
});