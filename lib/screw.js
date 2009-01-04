module("Screw", function(c) { with (c) {
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
      description.parent_description = this;
      this.child_descriptions.push(description);
    })

    def('add_example', function(example) {
      example.parent_description = this;
      this.examples.push(example);
    })

    def('add_before', function(fn) {
      this.befores.push(fn);
    })

    def('add_after', function(fn) {
      this.afters.push(fn);
    })

    def('run', function() {
      var run_it = function() {
        this.run()
      };
      Screw.each(this.examples, run_it);
      Screw.each(this.child_descriptions, run_it);
    });

    def('run_befores', function() {
      if (this.parent_description) {
        this.parent_description.run_befores();
      }

      Screw.each(this.befores, function() {
        this();
      });
    });

    def('run_afters', function() {
      Screw.each(this.afters.reverse(), function() {
        this();
      });

      if (this.parent_description) {
        this.parent_description.run_afters();
      }
    });
  });

  constructor("Example", function() {
    def('initialize', function(name, fn) {
      this.name = name;
      this.fn = fn;
    });

    def('run', function() {
      this.parent_description.run_befores();
      this.fn()
      this.parent_description.run_afters();
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

  def('each', function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn.call(array[i]);
    }
  });

  module("Interface", function() {
    def('Runner', {
      content: function(b) { with (b) {
        ul(function() {
          Screw.each(Screw.global_description().child_descriptions, function() {
            keyed_subview('descriptions', this.name, Screw.Interface.Description, {description: this});
          });
        });
      }}
    });

    def('Description', {
      content: function(b, initial_attributes) { with (b) {
        var description = initial_attributes.description;
          li({class: 'description'}, function() {
            h1(description.name);
            ul({class: 'examples'}, function() {
              Screw.each(description.examples, function() {
                keyed_subview('examples', this.name, Screw.Interface.Example, {example: this});
              })
            });
            ul({class: 'child_descriptions'}, function() {
              Screw.each(description.child_descriptions, function() {
                keyed_subview('child_descriptions', this.name, Screw.Interface.Description, {description: this});
              })
            });
          });
      }}
    });

    def('Example', {
      content: function(b, initial_attributes) {
        b.li(initial_attributes.example.name, {'class': 'example'});
      }
    });
  });
}});

$(function() {
  $('body').html(Disco.build(Screw.Interface.Runner));
});

Screw.Unit(function(c) { with (c) {
  before(function() {
    console.debug("1");
  })

  after(function() {
    console.debug("1a");
  })

  describe("foo", function() {
    before(function() {
      console.debug("2");
    })

    after(function() {
      console.debug("2a");
    })

    describe("bar", function() {
      before(function() {
        console.debug("3");
      })

      after(function() {
        console.debug("3a");
      })

      it("runs", function() {
        console.debug("*");
      });
    });
  });
}});

Screw.global_description().run();