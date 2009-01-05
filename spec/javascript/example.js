
Screw.Unit(function(c) { with (c) {
  before(function() {
    console.debug("1");
  })

  after(function() {
    console.debug("1a");
  })

  describe("Something object", function() {
    before(function() {
      console.debug("2");
    })

    after(function() {
      console.debug("2a");
    })

    describe("#some_method", function() {
      before(function() {
        console.debug("3");
      })

      after(function() {
        console.debug("3a");
      })

      it("does its thing", function() {

      });
    });
  });
}});

Screw.global_description().run();