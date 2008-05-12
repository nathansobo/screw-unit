Screw.Matchers["have"] = {
  match: function(expected, actual) {
    return actual.find(expected).length > 0;
  },
  failure_message: function(expected, actual, not) {
    return 'expected ' + $.print(actual) + (not ? ' to not have ' : ' to have ') + $.print(expected);
  }
}