Screw.Unit(function(screw) { with(screw) {
  describe("Screw.Unit", function() {
    describe("when the passed-in function has an arity of 1", function() {
      it("passes the Screw.Unit context into the function", function() {
        expect(true).to(equal, true);
      });
    });
  });
}});