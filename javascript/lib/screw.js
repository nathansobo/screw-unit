module("Screw", function(c) { with (c) {
  def('Unit', function(specification) {
    specification(new Screw.Context());
  });

  def('root_description', function() {
    return this._root_description = this._root_description || new Screw.Description("All specs");
  });

  def('mocks', []);

  def('reset_mocks', function() {
    Screw.each(Screw.mocks, function() {
      this.mocked_object[this.function_name] = this.original_function;
    })
    Screw.mocks = [];
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
      this._description_stack = [this.root_description()];
    }
    return this._description_stack;
  });

  def('map', function(array, fn) {
    var results = [];
    Screw.each(array, function() {
      results.push(fn.call(this));
    });
    return results;
  })

  def('each', function(array, fn) {
    for (var i = 0; i < array.length; i++) {
      fn.call(array[i]);
    }
  });

  def('reverse_each', function(array, fn) {
    for (var i = array.length - 1; i >= 0; i--) {
      fn.call(array[i]);
    }
  });
}});