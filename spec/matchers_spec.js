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
        it('prints "expected "expected" to (not) be equal "actual""', function() {
          var message = null;
          try { expect(1).to(equal, 2) } catch(e) { message = e }
          expect(message).to(equal, 'expected "1" to equal "2"');
          
          try { expect(1).to_not(equal, 1) } catch(e) { message = e }
          expect(message).to(equal, 'expected "1" to not equal "1"');
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
      
      describe(".failure_message", function() {
        it('prints "expected "actual" to (not) match "expected"', function() {
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
          expect(message).to(equal, 'expected "[1]" to be empty');
          
          try { expect([]).to_not(be_empty) } catch(e) { message = e }
          expect(message).to(equal, 'expected "[]" to not be empty');
        });
      });
    });
  });
});