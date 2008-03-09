describe("simple describe", function() {
  it("should pass", function() {
    true.should(equal, true)
  });
});

/*
describe("simple describe with one before", function() {
  var first_before_in_closure = false;

  before(function() {
    first_before_in_closure = true;
    this.first_before_on_context = true;
  });

  it("should pass", function() {
    
  });
});

describe("simple describe", function() {
  describe("foo", function() {
    it("should pass", function() {
    
    });
  });
});

describe("Outer describe", function() {
  before(function() {
  });
  
  describe("Inner describe", function() {
    before(function() {
    });
    
    it("runs the outer before, then the inner before, then this it", function() {
      
    });
  });
});*/