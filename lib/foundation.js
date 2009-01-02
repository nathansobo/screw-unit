function module(name, definition) {
  var current_constructor;

  if (!window[name]) {
    window[name] = {};
  }
  var module_stack = [window[name]];

  function current_module() {
    return module_stack[module_stack.length -1];
  }

  function push_module(name) {
    if (!current_module()[name]) {
      current_module()[name] = {};
    }
    var module = current_module()[name];
    module_stack.push(module);
    return module;
  }
  
  function pop_module() {
    module_stack.pop();
  }
  
  var keywords = {
    module: function(name, definition) {
      var module = push_module(name);
      definition.call(module);
      pop_module();
    },
    
    constructor: function(name, definition) {
      current_constructor = function() {
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        }
      };
      definition.call(current_constructor);
      current_module()[name] = current_constructor;
      current_constructor = undefined;
    },

    include: function(mixin) {
      for (var slot_name in mixin) {
        current_constructor.prototype[slot_name] = mixin[slot_name];
      }
    },

    def: function(name, fn) {
      if(current_constructor) {
        current_constructor.prototype[name] = fn;
      } else {
        current_module()[name] = fn;
      }
    }
  }

  definition.call(current_module(), keywords);
}

module("Screw", function(c) { with(c) {
  module("Keywords", function() {
    def('describe', function(name, fn) {
      Screw.push_description(new Screw.Description(name));
      fn();
      Screw.pop_description();
    });
  });
  
  constructor("Context", function() {
    include(ScrewMatchers);
    include(Screw.Keywords);
  });

  constructor("Description", function() {
    def('initialize', function(name) {
      this.name = name;
      this.child_descriptions = [];
    });

    def('add_description', function(description) {
      this.child_descriptions.push(description);
    })
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
  describe("foo", function() {
    describe("bar", function() {
      
    });
  });
}});

console.debug(Screw.global_description());
