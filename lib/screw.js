module("Screw", function(c) { with(c) {
  module("Keywords", function() {
    def('describe', function(name, fn) {
      Screw.push_description(new Screw.Description(name));
      fn();
      Screw.pop_description();
    });

    def('it', function(name, fn) {
      Screw.current_description().add_example(new Screw.Example(name, fn));
    })
    
    def('before', function(fn) {
      Screw.current_description().add_before(fn);
    })

    def('after', function(fn) {
      Screw.current_description().add_after(fn);
    })
  });

  constructor("Context", function() {
    include(ScrewMatchers);
    include(Screw.Keywords);
  });

  constructor("Description", function() {
    def('initialize', function(name) {
      this.name = name;
      this.child_descriptions = [];
      this.examples = [];
      this.befores = [];
      this.afters = [];
    });

    def('add_description', function(description) {
      this.child_descriptions.push(description);
    })

    def('add_example', function(example) {
      this.examples.push(example);
    })

    def('add_before', function(fn) {
      this.befores.push(fn);
    })

    def('add_after', function(fn) {
      this.afters.push(fn);
    })
  });

  constructor("Example", function() {
    def('initialize', function(name, fn) {
      this.name = name;
      this.fn = fn;
    });
  });

  def('Unit', function(specification) {
    specification(new Screw.Context());
  });

  def('current_description', function() {
    return this.description_stack()[this.description_stack().length - 1];
  });

  def('push_description', function(description) {
    this.current_description().add_description(description);
    this.description_stack().push(description);
  });

  def('pop_description', function() {
    this.description_stack().pop();
  });

  def('description_stack', function() {
    if (!this._description_stack) {
      this._description_stack = [this.global_description()];
    }
    return this._description_stack;
  });

  def('global_description', function() {
    return this._global_description = this._global_description || new Screw.Description("");
  });
}});

Screw.Unit(function(c) { with(c) {
  before(function() {
    
  })
  
  describe("foo", function() {

    before(function() {
      
    })
    
    after(function() {

    })

    describe("bar", function() {
      
    });
  });
}});

console.debug(Screw.global_description());
