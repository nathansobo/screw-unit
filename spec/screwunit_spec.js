Screw.Unit(function() {
  var global_before_invoked = 0;
  var global_after_invoked = 0;
  before(function() {
    try {
      expect(global_before_invoked).to(equal, 0);
    } finally {
      global_before_invoked++;
      global_after_invoked = 0;
    }
  });

  after(function() {
    try {
      expect(global_after_invoked).to(equal, false);
    } finally {
      global_before_invoked = 0;
      global_after_invoked = 1;
    }
  });

  describe('Screw.Unit', function() {
    describe("Matchers", function() {
      describe("#equal", function() {
        describe("when actual is a primitive", function() {
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
          describe("and contents are primitives", function() {
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

          describe("and contents are Objects", function() {
            describe(".matches", function() {
              it("matches when all the items' expected's keys match all of actual's keys", function() {
                expect([{foo: 1, bar: 2}, {foo: 3, bar: 4}]).to(equal, [{foo: 1, bar: 2}, {foo: 3, bar: 4}]);
                expect([{foo: 1, bar: 2}, {foo: 3, bar: 4}]).to_not(equal, [{foo: 1, bar: 2}, {foo: 3, bar: 5}]);
              });
            });

            describe(".failure_message", function() {
              describe("on a positive failure", function() {
                it("prints 'expected [actual] to equal [expected]", function() {
                  var message = null;
                  try {
                    expect([{foo: 1, bar: 2}, {foo: 3, bar: 4}]).to(equal, [{foo: 1, bar: 2}, {foo: 3, bar: 5}]);
                  } catch(e) {
                    message = e;
                  }
                  expect(message).to(equal, "expected [[object Object],[object Object]] to equal [[object Object],[object Object]]");
                });
              });

              describe("on a negative failure", function() {
                it("prints 'expected [actual] to not equal [expected]", function() {
                  var message = null;
                  try {
                    expect([{foo: 1, bar: 2}, {foo: 3, bar: 4}]).to_not(equal, [{foo: 1, bar: 2}, {foo: 3, bar: 4}]);
                  } catch(e) {
                    message = e;
                  }
                  expect(message).to(equal, "expected [[object Object],[object Object]] to not equal [[object Object],[object Object]]");
                });
              });
            });
          });
        });

        describe("when actual is an Object", function() {
          describe(".matches", function() {
            it("matches when all expected's keys match all of actual's keys", function() {
              expect({foo: 1, bar: 2}).to(equal, {foo: 1, bar: 2});
              expect({foo: 1, bar: 2}).to_not(equal, {foo: 1, bar: 3});
            });
          });

          describe(".failure_message", function() {
            describe("on a positive failure", function() {
              it("prints 'expected [actual] to equal [expected]", function() {
                var message = null;
                try {
                  expect({foo: 1, bar: 2}).to(equal, {foo: 1, bar: 3});
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [[object Object]] to equal [[object Object]]");
              });
            });

            describe("on a negative failure", function() {
              it("prints 'expected [actual] to not equal [expected]", function() {
                var message = null;
                try {
                  expect({foo: 1, bar: 2}).to_not(equal, {foo: 1, bar: 2});
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [[object Object]] to not equal [[object Object]]");
              });
            });
          });
        });
      });

      describe("#match", function() {
        describe("when passed a Regex", function() {
          describe(".matches", function() {
            it("matches when expected =~ actual", function() {
              expect("The wheels of the bus").to(match, /bus/);
              expect("The wheels of the bus").to_not(match, /boat/);
            });
          });

          describe(".failure_message", function() {
            describe("on a positive failure", function() {
              it("prints 'expected [actual] to match [expected]", function() {
                var message = null;
                try {
                  expect("Hello").to(match, /Goodbye/);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [Hello] to match [/Goodbye/]");
              });
            });

            describe("on a negative failure", function() {
              it("prints 'expected [actual] to not match [expected]", function() {
                var message = null;
                try {
                  expect("Hello").to_not(match, /ello/);
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [Hello] to not match [/ello/]");
              });
            });
          });
        });

        describe("when passed a String", function() {
          describe(".matches", function() {
            it("matches when expected is included in actual", function() {
              expect("The wheels of the bus").to(match, "wheels");
              expect("The wheels of the bus").to_not(match, "oars");
            });
          });

          describe(".failure_message", function() {
            describe("on a positive failure", function() {
              it("prints 'expected [actual] to match [expected]", function() {
                var message = null;
                try {
                  expect("Hello").to(match, "goodbye");
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [Hello] to match [goodbye]");
              });
            });

            describe("on a negative failure", function() {
              it("prints 'expected [actual] to not match [expected]", function() {
                var message = null;
                try {
                  expect("Hello").to_not(match, "ello");
                } catch(e) {
                  message = e;
                }
                expect(message).to(equal, "expected [Hello] to not match [ello]");
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
        var before_invoked = 0;
        var after_invoked = 0;
        before(function() {
          try {
            expect(before_invoked).to(equal, 0);
          } finally {
            before_invoked++;
            after_invoked = 0;
          }
        });
        after(function() {
          try {
            expect(after_invoked).to(equal, 0);
          } finally {
            before_invoked = 0;
            after_invoked++;
          }
        });

        it("invokes the global before prior to an it", function() {
          expect(global_before_invoked).to(equal, 1);
        });

        it("invokes the before prior to an it", function() {
          expect(before_invoked).to(equal, 1);
        });

        it("invokes the after callback after an it", function() {
          expect(after_invoked).to(equal, 0);
        });

        it("invokes the global after callback after an it", function() {
          expect(global_after_invoked).to(equal, 0);
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