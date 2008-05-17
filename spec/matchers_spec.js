Screw.Unit(function() {
  describe("Matchers", function() {
    describe('#equal', function() {
      it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
      });
      
      describe('when given an object', function() {
        it("matches Objects with the same keys and values", function() {
          expect({a: 'b', c: 'd'}).to(equal, {a: 'b', c: 'd'});
          expect({a: 'b', c: 'd', e: 'f'}).to_not(equal, {a: 'b', c: 'd', e: 'G'});
        });
        
      });
      
      describe('when given an array', function() {
        it("matches Arrays with the same elements", function() {
          expect([1, 2, 4]).to(equal, [1, 2, 4]);
          expect([1, 2, 3]).to_not(equal, [3, 2, 1]);
        });
        
        it("recursively applies equality to complex elements", function() {
          expect([{a: 'b'}, {c: 'd'}]).to(equal, [{a: 'b'}, {c: 'd'}]);
          expect([{a: 'b'}, {c: 'd'}]).to_not(equal, [{a: 'b'}, {c: 'E'}]);
        });
      });
      
      describe(".failure_message", function() {
        it('prints "expected [expected] to (not) be equal [actual]"', function() {
          var message = null;
          try { expect(1).to(equal, 2) } catch(e) { message = e }
          expect(message).to(equal, 'expected 1 to equal 2');
          
          try { expect(1).to_not(equal, 1) } catch(e) { message = e }
          expect(message).to(equal, 'expected 1 to not equal 1');
        });
      });
    });
    
    describe('#match', function() {
      describe('when given a regular expression', function() {
        it("matches Strings produced by the grammar", function() {
          expect("The wheels of the bus").to(match, /bus/);
          expect("The wheels of the bus").to_not(match, /boat/);
        });
      });
      
      describe('when given a string', function() {
        it("matches [expected]s containing [actual]s", function() {
          expect("The wheels of the bus").to(match, "wheels");
          expect("The wheels of the bus").to_not(match, "oars");
        });
      });

      describe('when given an integer', function() {
        it("matches [expected]s containing [actual]s", function() {
          expect("1 time").to(match, 1);
          expect("2 times").to_not(match, 3);
        });
      });
      
      describe(".failure_message", function() {
        it('prints "expected [actual] to (not) match [expected]', function() {
          var message = null;
          try { expect("hello").to(match, "schmello") } catch(e) { message = e }
          expect(message).to(equal, 'expected "hello" to match "schmello"');
          
          try { expect("hello").to_not(match, "ello") } catch(e) { message = e }
          expect(message).to(equal, 'expected "hello" to not match "ello"');
        });
      });
    });
    
    describe('#be_empty', function() {
      it("matches Arrays with no elements", function() {
        expect([]).to(be_empty);
        expect([1]).to_not(be_empty);
      });
      
      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) be empty", function() {
          var message = null;
          try { expect([1]).to(be_empty) } catch(e) { message = e }
          expect(message).to(equal, 'expected [ 1 ] to be empty');
          
          try { expect([]).to_not(be_empty) } catch(e) { message = e }
          expect(message).to(equal, 'expected [] to not be empty');
        });
      });
    });

    describe('#have_length', function() {
      it("matches Arrays of the expected length", function() {
        expect([]).to(have_length, 0);
        expect([1]).to(have_length, 1);
        expect([1, 2, 3]).to_not(have_length, 4);
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) have length [expected]", function() {
          var message = null;
          try { expect([1, 2]).to(have_length, 4) } catch(e) { message = e }
          expect(message).to(equal, 'expected [ 1, 2 ] to have length 4');
          
          try { expect([1]).to_not(have_length, 1) } catch(e) { message = e }
          expect(message).to(equal, 'expected [ 1 ] to not have length 1');
        });
      });
    });

    describe('#be_null', function() {
      it("matches null", function() {
        expect(null).to(be_null);
        expect(1).to_not(be_null);
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) be null", function() {
          var message = null;
          try { expect(1).to(be_null) } catch(e) { message = e }
          expect(message).to(equal, 'expected 1 to be null');

          try { expect(null).to_not(be_null) } catch(e) { message = e }
          expect(message).to(equal, 'expected null to not be null');
        });
      });
    });

    describe('#be_undefined', function() {
      it("matches undefined", function() {
        expect(undefined).to(be_undefined);
        expect(1).to_not(be_undefined);
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) be undefined", function() {
          var message = undefined;
          try { expect(1).to(be_undefined) } catch(e) { message = e }
          expect(message).to(equal, 'expected 1 to be undefined');

          try { expect(undefined).to_not(be_undefined) } catch(e) { message = e }
          expect(message).to(equal, 'expected undefined to not be undefined');
        });
      });
    });

    describe('#be_true', function() {
      it("matches values that are considered true conditions", function() {
        expect(true).to(be_true);
        expect(1).to(be_true);
        expect(false).to_not(be_true);
        expect(undefined).to_not(be_true);
        expect(null).to_not(be_true);
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) be true", function() {
          var message = true;
          try { expect(false).to(be_true) } catch(e) { message = e }
          expect(message).to(equal, 'expected false to be true');

          try { expect(true).to_not(be_true) } catch(e) { message = e }
          expect(message).to(equal, 'expected true to not be true');
        });
      });
    });

    describe('#be_false', function() {
      it("matches values that are considered false conditions", function() {
        expect(false).to(be_false);
        expect(undefined).to(be_false);
        expect(null).to(be_false);
        expect(true).to_not(be_false);
        expect(1).to_not(be_false);
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) be false", function() {
          var message = false;
          try { expect(true).to(be_false) } catch(e) { message = e }
          expect(message).to(equal, 'expected true to be false');

          try { expect(false).to_not(be_false) } catch(e) { message = e }
          expect(message).to(equal, 'expected false to not be false');
        });
      });
    });

    describe('#match_selector', function() {
      var elt;
      before(function() {
        elt = $("<div class='foo'></div>");
      });

      it("matches a jQuery element against the expected selector", function() {
        expect(elt).to(match_selector, 'div.foo');
        expect(elt).to_not(match_selector, 'div.bar');
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) match selector [expected]", function() {
          var message = false;
          try { expect(elt).to(match_selector, 'div.bar') } catch(e) { message = e }
          expect(message).to(equal, 'expected $([ <div class="foo"> ]) to match selector div.bar');
          
          try { expect(elt).to_not(match_selector, 'div.foo') } catch(e) { message = e }
          expect(message).to(equal, 'expected $([ <div class="foo"> ]) to not match selector div.foo');
        });
      });
    });

    describe('#contain_selector', function() {
      var elt;
      before(function() {
        elt = $("<div><div class='foo'></div></div>");
      });

      it("matches a jQuery element against the expected selector", function() {
        expect(elt).to(contain_selector, 'div.foo');
        expect(elt).to_not(contain_selector, 'div.bar');
      });

      describe(".failure_message", function() {
        it("prints 'expected [actual] to (not) match selector [expected]", function() {
          var message = false;
          try { expect(elt).to(contain_selector, 'div.bar') } catch(e) { message = e }
          expect(message).to(equal, 'expected $([ <div> ]) to contain selector div.bar');

          try { expect(elt).to_not(contain_selector, 'div.foo') } catch(e) { message = e }
          expect(message).to(equal, 'expected $([ <div> ]) to not contain selector div.foo');
        });
      });
    });

  });
});