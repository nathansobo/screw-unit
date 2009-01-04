Screw.Unit(function() {
  describe("Disco.Namespace", function() {
    var namespace;
    
    before(function() {
      namespace = Disco.Namespace('La::La', { canned: 'peaches' });
    });
    
    describe('when passed a valid (found) namespace string', function() {
      describe('when the second argument is undefined', function() {
        it('returns the hash, keyed by that namespace', function() {
          expect(Disco.Namespace('La::La')).to(equal, { canned: 'peaches' });
        });
      });
      
      describe('when the second argument is a function', function() {
        it('calls the function with the hash', function() {
          var found;
          Disco.Namespace('La::La', function(ns) { found = ns.canned });
          expect(found).to(equal, 'peaches');
        });
      });

      describe('when the second argument is a hash', function() {
        describe('when the namespace is not yet registered', function() {
          before(function() {
            expect(Disco.Namespace.namespaces['So::So']).to(equal, undefined);
          });
          
          it('inserts the hash into the namespace store', function() {
            Disco.Namespace('So::So', { canned: 'corn' });
            expect(Disco.Namespace.namespaces['So::So']).to(equal, { canned: 'corn' });
          });
        });
        
        describe('when the namespace is already registered', function() {
          before(function() {
            expect(Disco.Namespace.namespaces['La::La']).to(equal, { canned: 'peaches' });
          });

          it('merges the hash with the already registered hash', function() {
            Disco.Namespace('La::La', { pickled: 'ginger' });
            expect(Disco.Namespace.namespaces['La::La']).to(equal, { canned: 'peaches', pickled: 'ginger' });

            Disco.Namespace('La::La', { canned: 'beans' });
            expect(Disco.Namespace.namespaces['La::La']).to(equal, { canned: 'beans', pickled: 'ginger' });
          });
        });
      });
    });
    
    describe('when passed an invalid (not found) namespace string', function() {
      it('throws an exception', function() {
        var caught;
        
        try {
          Disco.Namespace('Chicken::Head');
        }
        catch(e) {
          caught = e;
        }
        
        expect(caught).to(equal, 'InvalidNamespaceException for Chicken::Head');
      });
    });
  });
});