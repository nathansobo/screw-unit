Screw.Matchers = {
  expect: function(actual) {
    return {
      to: function(matcher, expected, not) {
        var matched = matcher.match(expected, actual);
        if (not ? matched : !matched) {
          throw(matcher.failure_message(expected, actual, not));
        }
      },
      to_not: function(matcher, expected) {
        this.to(matcher, expected, true);
      }
    }
  },
  equal: {
    match: function(expected, actual) {
      if (Screw.Matchers.equal.by_type[expected.constructor.name])
        return Screw.Matchers.equal.by_type[expected.constructor.name](expected, actual);
      else
        return expected == actual;
    },
    failure_message: function(expected, actual, not) {
      return 'expected ' + $([actual]).print() + (not ? ' to not equal ' : ' to equal ') + $([expected]).print();
    },
    by_type: {
      Array: function(expected, actual) {
        for (var i = 0; i < actual.length; i++)
          if (!Screw.Matchers.equal.match(expected[i], actual[i])) return false;
        return actual.length == expected.length;
      },
      Object: function(expected, actual) {
        for (var key in expected)
          if (!Screw.Matchers.equal.match(expected[key], actual[key])) return false;
        for (var key in actual)
          if (!Screw.Matchers.equal.match(actual[key], expected[key])) return false;
        return true;
      }
    }
  },
  match: {
    match: function(expected, actual) {
      if (expected.constructor == String) {
        return actual.indexOf(expected) > -1;
      } else {
        return expected.exec(actual);
      }
    },
    failure_message: function(expected, actual, not) {
      return 'expected ' + $([actual]).print() + (not ? ' to not match ' : ' to match ') + $([expected]).print();
    }
  },
  be_empty: {
    match: function(expected, actual) {
      if (actual.length == undefined) {
        throw(actual.toString() + " does not respond to length");
      }
      return actual.length == 0;
    },
    failure_message: function(expected, actual, not) {
      return 'expected ' + $([actual]).print() + (not ? ' to not be empty' : ' to be empty');
    }
  }
}