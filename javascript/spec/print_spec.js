Screw.Unit(function(c) { with(c) {
  describe("Print", function() {
    describe('when given undefined', function() {
      it("returns 'undefined'", function() {
        expect($.print(undefined)).to(equal, 'undefined');
      });
    });
    
    describe('when given null', function() {
      it("returns 'null'", function() {
        expect($.print(null)).to(equal, 'null');
      });
    });
    
    describe('when given a number', function() {
      it("returns the string representation of the number", function() {
        expect($.print(1)).to(equal, '1');
        expect($.print(1.01)).to(equal, '1.01');
        expect($.print(-1)).to(equal, '-1');
      });
    });
    
    describe('when given a boolean', function() {
      it("returns the string representation of the boolean", function() {
        expect($.print(true)).to(equal, 'true');
        expect($.print(false)).to(equal, 'false');
      });
    });
    
    describe('when given a string', function() {
      it("returns the string, quoted", function() {
        expect($.print('asdf')).to(equal, '"asdf"');
      });
      
      describe('when the string is longer than the [max_string] option', function() {
        it("returns the string, truncated", function() {
          expect($.print('asdf', { max_string: 3 })).to(equal, '"asd..."');
        });        
      });
      
      describe('when the strings has quotes or escaped characters', function() {
        it("returns the string, with quotes and escaped characters escaped", function() {
          expect($.print('as"df')).to(equal, '"as\\"df"');
          expect($.print('as\tdf')).to(equal, '"as\\tdf"');
        });        
      });
    });
    
    describe('when given a function', function() {
      it("returns the function's signature", function() {
        expect($.print(function() {})).to(equal, 'function ()');
        expect($.print(function foo() {})).to(equal, 'function foo()');
        expect($.print(function foo(bar) {})).to(equal, 'function foo(bar)');
      });        
    });

    describe('when given a RegExp', function() {
      it('should print the regexp', function() {
        expect($.print(/abc/i)).to(equal, '/abc/i');
      });
    });

    describe('when given NaN', function() {
      it('should print the string "NaN"', function() {
        expect($.print(NaN)).to(equal, 'NaN');
      });
    });

    describe('when given 0', function() {
      it('should print the string "0"', function() {
        expect($.print(0)).to(equal, '0');
      });
    });
    
    describe('when given an element', function() {
      it("returns the string representation of the element", function() {
        expect($.print($('<div>').get(0))).to(equal, '<div>');
        expect($.print($('<div foo="bar">').get(0))).to(equal, '<div>');
        expect($.print($('<div class="foo" id="bar">').get(0))).to(equal, '<div class="foo" id="bar">');
      });

      describe('when the element is an img', function() {
        it('prints out the img src attribute', function() {
          expect($.print($('<img src="test.png">'))).to(match, /<img src=".+?test.png">/);
        })
      });
    });

    describe('when given an array', function() {
      it("returns the printed elements, comma separated, encircled by square brackets", function() {
        expect($.print([])).to(equal, '[]');
        expect($.print([1])).to(equal, '[ 1 ]');
        expect($.print([1, 2, 3])).to(equal, '[ 1, 2, 3 ]');
      });
      
      describe('when the array is longer than the [max_array] option', function() {
        it("returns the printed array, truncated", function() {
          expect($.print([1, 2, 3, 4], { max_array: 2 })).to(equal, '[ 1, 2, 2 more... ]');
        });
      });
      
      describe('when the array has arrays as its elements', function() {
        it("returns the recursively printed array", function() {
          expect($.print([[]])).to(equal, '[ [] ]');
          expect($.print([ [1, 2, 3], 4 ])).to(equal, '[ [ 1, 2, 3 ], 4 ]');
        });
      });

      describe('when the array has objects as its elements', function() {
        it("returns recursively printed array", function() {
          expect($.print([{}])).to(equal, '[ {} ]');
          expect($.print([ { foo: 'bar' }, 'baz' ])).to(equal, '[ { foo: "bar" }, "baz" ]');
        });
      });
    });

    describe('when given arguments', function() {
      it("returns the printed array of elements ", function() {
        var args = null;
        (function(){ args = arguments })(1,2,3);
        expect($.print(args)).to(equal, '[ 1, 2, 3 ]');
      });
    });

    describe('when given a jQuery', function() {
      it("returns the printed array of elements engirthed in '$()'", function() {
        expect($.print($('<div>'))).to(equal, '$([ <div> ])');
      });
    });
    
    describe('when given a NodeList', function() {
      it("returns the printed array of elements in the list", function() {
        expect($.print(document.getElementsByTagName('body'))).to(equal, '[ <body> ]');
      });
    });

    describe('when given an object', function() {
      it("returns the keys and values of the object, enraptured with curly braces", function() {
        expect($.print({})).to(equal, '{}');
        expect($.print({ foo: 1, bar: 2 })).to(equal, '{ foo: 1, bar: 2 }');
      });
      
      describe('when the values of the object are non-primitive', function() {
        it("recursively prints the keys and values", function() {
          expect($.print({ foo: [1, 2] })).to(equal, '{ foo: [ 1, 2 ] }');
        });
        
        describe('when the object has circular references', function() {
          it("returns elipses for circularities", function() {
            var circular = {};
            circular[0] = circular;
            expect($.print(circular)).to(equal, '{ 0: ... }');
          });
        });
      });
    });
  });
}});