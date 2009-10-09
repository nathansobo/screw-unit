Screw = {};
(function(Screw, Monarch) {

Monarch.module("Screw", {
  Unit: function(specification) {
    if (!this.shared_context) this.shared_context = new Screw.Context();
    specification(this.shared_context);
  },

  clear_descriptions: function() {
    this._description_stack = null;
    this._root_description = null;
  },

  root_description: function() {
    return this._root_description = this._root_description || new Screw.Description("All specs");
  },

  mocks: [],

  reset_mocks: function() {
    Screw.each(Screw.mocks, function() {
      this.mocked_object[this.function_name] = this.original_function;
    })
    Screw.mocks = [];
  },

  current_description: function() {
    return this.description_stack()[this.description_stack().length - 1];
  },

  push_description: function(description) {
    this.description_stack().push(description);
  },

  pop_description: function() {
    var description = this.description_stack().pop();
    this.current_description().add_description(description)
  },

  push_scenario: function(scenario_description) {
    this.description_stack().push(scenario_description);
  },

  pop_scenario: function() {
    var scenario_description = this.description_stack().pop();
    this.current_description().add_scenario(scenario_description);
  },

  description_stack: function() {
    if (!this._description_stack) {
      this._description_stack = [this.root_description()];
    }
    return this._description_stack;
  },

  map: function(array, fn) {
    var results = [];
    Screw.each(array, function() {
      results.push(fn.call(this));
    });
    return results;
  },

  each: function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn.call(array[i]);
    }
  },

  reverse_each: function(array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
      fn.call(array[i]);
    }
  }
});

})(Screw, Monarch);
