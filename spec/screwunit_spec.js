Screw.Unit(function() {
  describe('Screw.Unit', function() {
    describe("Matchers", function() {
      describe("#equal", function() {
        describe("when actual is not an Array", function() {
          describe(".matches", function() {
            it("matches when expected == actual", function() {
              expect(true).to(equal, true);
              expect(true).to_not(equal, false);
            });
          });

          describe(".failure_message", function() {
            describe("on a positive failure", function() {
              it("prints 'expected [actual] to equal [expected]", function() {
                var message = null;
                try {
                  expect(true).to(equal, false);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [true] to equal [false]");
              });
            });

            describe("on a negative failure", function() {
              it("prints 'expected [actual] to not equal [expected]", function() {
                var message = null;
                try {
                  expect(true).to_not(equal, true);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [true] to not equal [true]");
              });
            });
          });
        });

        describe("when actual is an Array", function() {
          describe(".matches", function() {
            it("matches when Arrays the expected and actual have the same contents", function() {
              expect([1, 2, 3]).to(equal, [1, 2, 3]);
              expect([1, 2, 3]).to_not(equal, [3, 2, 1]);
            });
          });

          describe(".failure_message", function() {
            describe("on a positive failure", function() {
              it("prints 'expected [actual] to equal [expected]", function() {
                var message = null;
                try {
                  expect([1, 2, 3]).to(equal, [1, 2, 4]);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [1,2,3] to equal [1,2,4]");
              });
            });

            describe("on a negative failure", function() {
              it("prints 'expected [actual] to not equal [expected]", function() {
                var message = null;
                try {
                  expect([1, 2, 3]).to_not(equal, [1, 2, 3]);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [1,2,3] to not equal [1,2,3]");
              });
            });
          });
        });
      });

      describe("#be_empty", function() {
        describe(".matches", function() {
          it("matches when Array#length == 0", function() {
            expect([]).to(be_empty);
            expect([1]).to_not(be_empty);
          });
        });

        describe(".failure_message", function() {
          describe("on a positive failure", function() {
            it("prints 'expected ... to be empty'", function() {
              var message = null;
              try {
                expect([1]).to(be_empty);
              } catch(e) {
                message = e;
              }
              expect(message).to(equal, "expected [1] to be empty");
            });
          });

          describe("on a negative failure", function() {
            it("prints 'expected ... to not be empty'", function() {
              var message = null;
              try {
                expect([]).to_not(be_empty);
              } catch(e) {
                message = e;
              }
              expect(message).to(equal, "expected [] to not be empty");
            });
          });
        });
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