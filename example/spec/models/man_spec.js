Screw.Unit(function() {
  describe('Man', function() {
    var man;
    before(function() {
      man = new Man({luck: 5});
    });
    
    describe('#decrement_luck', function() {
      it("decrements the luck field by the given amount", function() {
        man.decrement_luck(3);
        expect(man.luck()).to(equal, 2)
      });
      
      describe('when the decrement exceeds the luck balance', function() {
        it("decrements the luck field to zero", function() {
          man.decrement_luck(10000000000);
          expect(man.luck()).to(equal, 0);
        });
      });
    });
    
    describe('@click', function() {
      before(function() {
        $('#dom_test').append(man.render());
      });
      
      it("removes the man's hair", function() {
        expect($('.man')).to(have, '.hair');
        $('.man').click();
        expect($('.man')).to_not(have, '.hair');
      });
    });
  });
});