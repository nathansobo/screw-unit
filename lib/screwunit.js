var ScrewUnit = {
  describes: []
};

// Specifications
function describe(description, fn) {
  ScrewUnit.describes.push({its: [], befores: []});
  fn();
}

function it(description, fn) {
  $.last(ScrewUnit.describes).its.push(fn);
}

function before(fn) {
  $.last(ScrewUnit.describes).befores.push(fn)
}

// Utilities
(function($) {
  $.last = function(arr) {
    return arr[arr.length-1];
  }
})(jQuery);

// Matcher
var equal = function(other) {
  if (this instanceof Array) {
    return array_equal.call(this, other);
  } else {
    return this == other;
  }
}

var array_equal = function(other) {
  $.each(this, function(i, element) {
    if (element != other[i]) {
      return false;
    }
  });
  return this.length == other.length;
}

// Runner
$(function() {
  Object.prototype.should = function(matcher, expected, not) {
    var matched = matcher.call(this, expected);
    if (not ? !matched : matched) {
      console.debug("Passed");
    } else {
      console.debug("Failed");
    }
  };

  Object.prototype.should_not = function(matcher, expected) {
    this.should(matcher, expected, true);
  };

  $.each(ScrewUnit.describes, function(i, describe) {
    $.each(describe.its, function(i, it) {
      $.each(describe.befores, function(i, before) {
        before();
      })
      it();
    });
  });
  
  delete Object.prototype.should;
  delete Object.prototype.should_not;
});