var ScrewUnit = {
  current_describes: [],
  describes: []
};

// Specifications
function describe(description, fn) {
  var describe = {
    its: [],
    befores: [],
    parent: $.last(ScrewUnit.current_describes),
    push_it: function(it) {
      this.its.push(it);
    },
    push_before: function(before) {
      this.befores.push(before);
    },
    call_befores: function() {
      if (this.parent) {
        this.parent.call_befores();
      };
      $.each(this.befores, function(i, before) {
        before();
      })
    }
  };
  ScrewUnit.describes.push(describe);
  ScrewUnit.current_describes.push(describe);
  fn();
  ScrewUnit.current_describes.pop();
}

function it(description, fn) {
  $.last(ScrewUnit.current_describes).push_it(fn);
}

function before(fn) {
  $.last(ScrewUnit.current_describes).push_before(fn)
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
      describe.call_befores();
      it();
    });
  });
  
  delete Object.prototype.should;
  delete Object.prototype.should_not;
});