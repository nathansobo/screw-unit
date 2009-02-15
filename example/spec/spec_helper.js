require("/cat");
require("/man");

Screw.Unit(function(c) { with(c) {
  before(function() {
    $('dom_test').empty();
  });
}});