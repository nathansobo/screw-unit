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